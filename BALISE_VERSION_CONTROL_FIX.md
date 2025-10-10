# Balise Version Control Fix

## Problem

When uploading multiple files for a balise, each file upload was creating a NEW version, resulting in multiple versions instead of one.

### Example of the Bug:

User saves balise with 3 files:

```
1. Metadata update: /api/balise/123/add (JSON) → Version 2 created ❌
2. File 1 upload: /api/balise/123/add (multipart) → Version 3 created ❌
3. File 2 upload: /api/balise/123/add (multipart) → Version 4 created ❌
4. File 3 upload: /api/balise/123/add (multipart) → Version 5 created ❌
```

**Result: 4 versions created when only 1 was intended!**

## Solution

Modified `add-balise.ts` Lambda to distinguish between:

1. **Metadata changes** (create new version)
2. **File-only uploads** (add to current version)

### Logic Flow:

```typescript
if (existingBalise) {
  // Check if metadata is being changed
  const hasMetadataChange = !isFileUpload || (body.description && body.description !== existingBalise.description);

  if (hasMetadataChange) {
    // 1. Save old version to history
    // 2. Increment version number
    // 3. Update all metadata fields
    // 4. Upload file (if any) to NEW version folder
  } else {
    // 1. Keep current version number
    // 2. Only update fileTypes array
    // 3. Upload file to CURRENT version folder
  }
}
```

## Version Detection Rules

### Creates NEW Version When:

- ✅ Metadata-only request (JSON with description/bucketId changes)
- ✅ First multipart request that includes `baliseData` with description change

### Adds to CURRENT Version When:

- ✅ File upload without metadata (multipart without baliseData)
- ✅ File upload with same metadata (multipart with baliseData but no description change)

## Updated Flow

### Example 1: Save with 3 Files

```
User edits description and adds 3 files:

1. Metadata update: /api/balise/123/add
   - Content-Type: application/json
   - Body: { "description": "New description" }
   - Result: Version 2 created ✅

2. File 1 upload: /api/balise/123/add
   - Content-Type: multipart/form-data
   - Body: file only (no baliseData)
   - Result: File added to version 2 ✅

3. File 2 upload: /api/balise/123/add
   - Content-Type: multipart/form-data
   - Body: file only
   - Result: File added to version 2 ✅

4. File 3 upload: /api/balise/123/add
   - Content-Type: multipart/form-data
   - Body: file only
   - Result: File added to version 2 ✅

Final S3 Structure:
balise_123/
  v2/
    document.pdf
    diagram.leu
    layout.il
```

### Example 2: Update Description Only (No Files)

```
User only changes description:

1. Metadata update: /api/balise/123/add
   - Content-Type: application/json
   - Body: { "description": "Updated description" }
   - Result: Version 3 created ✅

S3 files remain in old version (no new files uploaded)
```

### Example 3: Add Files to Existing Version

```
User adds more files without changing description:

1. File upload: /api/balise/123/add
   - Content-Type: multipart/form-data
   - Body: file only (no baliseData or same description)
   - Result: File added to current version 2 ✅

S3 Structure:
balise_123/
  v2/
    document.pdf (existing)
    diagram.leu (existing)
    layout.il (existing)
    newfile.pdf (newly added) ✅
```

## Key Changes in Code

### Before (WRONG):

```typescript
if (existingBalise) {
  // ALWAYS created new version
  await database.baliseVersion.create({ ... });
  const newVersion = existingBalise.version + 1;

  await database.balise.update({
    version: newVersion,  // Always incremented
    // ... update all fields
  });
}
```

### After (CORRECT):

```typescript
if (existingBalise) {
  const hasMetadataChange = !isFileUpload || (body.description && body.description !== existingBalise.description);
  let newVersion = existingBalise.version;

  if (hasMetadataChange) {
    // Create version history entry
    await database.baliseVersion.create({ ... });
    newVersion = existingBalise.version + 1;
    log.info(`Creating new version ${newVersion}`);
  } else {
    log.info(`Adding file to existing version ${newVersion}`);
  }

  // Update only relevant fields
  const updateData = { fileTypes: updatedFileTypes };

  if (hasMetadataChange) {
    updateData.version = newVersion;
    updateData.description = body.description;
    // ... other metadata fields
  }

  await database.balise.update({ data: updateData });
}
```

## Frontend Behavior (No Changes Needed)

The frontend continues to work as before:

1. Send metadata update (creates version if description changed)
2. Send files one by one (each adds to current version)

The backend now intelligently determines when to create a new version vs. adding to the current one.

## Testing Checklist

- [ ] Create new balise with 3 files → Verify only 1 version created
- [ ] Edit description only → Verify new version created, no S3 files
- [ ] Edit with 3 new files → Verify only 1 new version, 3 files in new version folder
- [ ] Add file without changing description → Verify no new version, file added to current version
- [ ] Check version history in UI → Should show logical versions, not one per file
- [ ] Verify S3 folder structure matches version numbers
- [ ] Test with 10+ files → Verify still only creates 1 version

## Benefits

1. ✅ **Logical versioning**: One version per user edit, not per file
2. ✅ **Cleaner history**: Version timeline shows meaningful changes
3. ✅ **Correct file grouping**: All files from one edit are in same version folder
4. ✅ **Better UX**: Users see expected version numbers (v1, v2, v3) not (v1, v5, v12)
5. ✅ **Database efficiency**: Fewer version history entries

## Notes

- File uploads to an existing version will update the `fileTypes` array
- The version history (`BaliseVersion` table) only gets a new entry when metadata changes
- S3 folder structure remains consistent: `balise_{id}/v{version}/{filename}`
- This matches the expected behavior in the UI where users see one version per "save" action
