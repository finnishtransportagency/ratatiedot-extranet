# Balise File Replacement Logic

**Last Updated:** October 22, 2025  
**Version:** 2.0 - Bulk Replacement Implementation

---

## Overview

The balise file management system enables file uploads, replacements, and version control. The key feature is **bulk file replacement** where users can upload files for multiple balises at once, with automatic filename-based routing to the correct balise.

---

## Core Concept: Bulk File Replacement

### The Problem

Admin users need to update files for many balises regularly. The old tool allowed uploading multiple files at once, automatically matching files to balises by filename.

### The Solution

**Filename-based automatic routing:**

- Upload files: `10000.il`, `10000.leu`, `10000.bis`, `10002.il`, `10002.leu`, `12345.il`
- System automatically detects:
  - Files for balise `10000`: `.il`, `.leu`, `.bis`
  - Files for balise `10002`: `.il`, `.leu`
  - Files for balise `12345`: `.il`
- Creates new versions for all three balises in one operation

### Key Principle

**"Replace All" - Not "Keep Some"**

- When files are uploaded for a balise, ALL old files are replaced
- Old files remain in old version folder (version history preserved)
- New files go into new version folder
- No UI for "keeping some" files - it's always full replacement

---

## File Replacement Rules

### Rule 1: Always Full Replacement

```
Current files in balise 10000:
  - v1/10000.il
  - v1/10000.leu
  - v1/10000.bis

User uploads: 10000.il, 10000.leu

Result:
  - v1/ stays unchanged (history)
  - v2/10000.il  (new)
  - v2/10000.leu (new)
  - v1/10000.bis exists but NOT in v2

Balise 10000 now shows only: 10000.il, 10000.leu
```

**Why?** Users want to replace files, not merge them. If they upload 2 files, they want those 2 files to be the new set.

### Rule 2: No S3 Deletion

```
Old files stay in S3:
  balise_10000/v1/10000.bis  ← Still exists

Why?
  - Version history preserved
  - Can restore old versions if needed
  - Storage is cheap
```

### Rule 3: Backend Allows Flexibility

The API/backend should NOT prevent keeping old files in the new version. It just doesn't happen by default in the current workflow.

**Why?** Future features might allow selective keeping. Backend should be flexible.

---

## Storage Structure

### S3 Path Pattern

```
balise_{secondaryId}/v{version}/{filename}
```

### Example: Balise Evolution

```
Initial Upload (Version 1):
balise_10000/
  └── v1/
      ├── 10000.il
      ├── 10000.leu
      └── 10000.bis

After Replacement (Version 2):
balise_10000/
  ├── v1/
  │   ├── 10000.il   ← History preserved
  │   ├── 10000.leu  ← History preserved
  │   └── 10000.bis  ← History preserved
  └── v2/
      ├── 10000.il   ← New file
      └── 10000.leu  ← New file
      (10000.bis not in v2 = effectively "removed")

After Another Replacement (Version 3):
balise_10000/
  ├── v1/ [3 files]
  ├── v2/ [2 files]
  └── v3/
      ├── 10000.il
      ├── 10000.leu
      └── 10000.pdf  ← New file type added
```

---

## Bulk Upload Workflow

### Single Balise Mode (Current UI)

```
1. User goes to balise edit page
2. Uploads files
3. Saves
4. New version created with uploaded files
```

### Bulk Mode (Planned Feature)

```
1. User goes to bulk upload page
2. Uploads: 10000.il, 10000.leu, 10002.il, 12345.bis
3. System parses filenames:
   - Extract secondaryId from filename (e.g., "10000" from "10000.il")
   - Group files by secondaryId
4. For each balise:
   - Create new version
   - Upload files to balise_{secondaryId}/v{newVersion}/
   - Update database: balise.fileTypes = [uploaded filenames]
5. Result: 3 balises updated in one operation
```

### Filename Pattern Matching

```typescript
// Extract balise ID from filename
const filename = "10000.il";
const secondaryId = filename.split('.')[0]; // "10000"

// Supported patterns:
10000.il       → balise 10000
10000.leu      → balise 10000
10000.bis      → balise 10000
A-12345.pdf    → balise 12345 (if we strip prefix)
```

---

## Version Creation Logic

### Always Create Version When:

1. ✅ Files are replaced (even if same filenames)
2. ✅ Files are deleted
3. ✅ Metadata changes (description)

### Never Create Version When:

- ❌ Only viewing/downloading files

### Why Always Create Version?

- Audit trail: who changed what and when
- Rollback capability: restore old versions if needed
- Safety: never lose data

---

## Database Schema

### Balise Table (Current State)

```typescript
{
  id: UUID,
  secondaryId: number,      // User-facing ID (e.g., 10000)
  version: number,          // Current version (e.g., 3)
  description: string,
  fileTypes: string[],      // Current files: ["10000.il", "10000.leu"]
  createdBy: string,
  createdTime: Date,
  locked: boolean
}
```

### BaliseVersion Table (History)

```typescript
{
  id: UUID,
  baliseId: UUID,           // FK to Balise
  secondaryId: number,
  version: number,          // Historical version (e.g., 1, 2)
  fileTypes: string[],      // Files in that version
  createdBy: string,
  createdTime: Date
}
```

---

## API Design

### Single Balise Upload

```
PUT /api/balise/{secondaryId}/add

Body (multipart/form-data):
  - file: File
  - description: string (optional)

Process:
1. Check if balise exists
2. Increment version: currentVersion + 1
3. Save old version to BaliseVersion table
4. Upload file to: balise_{secondaryId}/v{newVersion}/{filename}
5. Update balise.fileTypes = [new filename]
6. Update balise.version = newVersion

Result:
  - Old files preserved in old version folder
  - New files in new version folder
```

### Bulk Upload (To Be Implemented)

```
POST /api/balise/bulk-upload

Body (multipart/form-data):
  - files: File[] (e.g., [10000.il, 10000.leu, 10002.il])

Process:
1. Parse filenames to extract secondaryIds
2. Group files by secondaryId:
   {
     "10000": [10000.il, 10000.leu],
     "10002": [10002.il]
   }
3. For each balise:
   - Validate balise exists
   - Increment version
   - Save old version to history
   - Upload files to new version folder
   - Update fileTypes array

Result:
  - Multiple balises updated in one request
  - Each gets a new version
```

---

## Frontend Implementation

### Current UI (Single Balise)

```tsx
// BaliseForm.tsx

1. File upload dropzone
2. File list shows uploaded files
3. Save button triggers upload

Current behavior in edit mode:
  - Shows existing files with strikethrough
  - User must click to keep (confusing)

Proposed behavior:
  - Remove "keep" UI entirely
  - Just show: "These files will replace existing files"
  - Simple and clear
```

### Proposed Bulk Upload UI

```tsx
// BulkUploadPage.tsx

1. Large dropzone: "Drop multiple files here"
2. After drop, show grouped by balise:

   Balise 10000:
     - 10000.il
     - 10000.leu
     - 10000.bis

   Balise 10002:
     - 10002.il
     - 10002.leu

   Balise 12345:
     - 12345.il

3. "Upload All" button
4. Progress bar for each balise
5. Success summary: "Updated 3 balises"
```

---

## Backend Implementation

### Key Functions

#### 1. Parse Filename for Balise ID

```typescript
function parseBaliseId(filename: string): number {
  // "10000.il" → 10000
  // "A-12345.pdf" → 12345
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}
```

#### 2. Group Files by Balise

```typescript
function groupFilesByBalise(files: File[]): Record<number, File[]> {
  const grouped: Record<number, File[]> = {};

  for (const file of files) {
    const baliseId = parseBaliseId(file.name);
    if (baliseId) {
      if (!grouped[baliseId]) grouped[baliseId] = [];
      grouped[baliseId].push(file);
    }
  }

  return grouped;
}
```

#### 3. Replace Files for Balise

```typescript
async function replaceBaliseFiles(secondaryId: number, files: File[]): Promise<void> {
  // 1. Get current balise
  const balise = await getBalise(secondaryId);

  // 2. Save current version to history
  await createVersionHistory(balise);

  // 3. Increment version
  const newVersion = balise.version + 1;

  // 4. Upload new files
  for (const file of files) {
    const s3Key = `balise_${secondaryId}/v${newVersion}/${file.name}`;
    await uploadToS3(s3Key, file);
  }

  // 5. Update database
  await updateBalise(secondaryId, {
    version: newVersion,
    fileTypes: files.map((f) => f.name),
  });
}
```

---

## Code Locations

### Frontend

- Single upload form: `packages/frontend/src/pages/Balise/BaliseForm.tsx`
- Edit page: `packages/frontend/src/pages/Balise/BaliseEditPage.tsx`
- Bulk upload page: `packages/frontend/src/pages/Balise/BulkUploadPage.tsx` (to be created)

### Backend

- Single upload: `packages/server/lambdas/balise/add-balise.ts`
- Bulk upload: `packages/server/lambdas/balise/bulk-upload-balises.ts` (to be created)
- Version history: `packages/server/lambdas/balise/create-version.ts`

### Database

- Schema: `packages/server/prisma/schema.prisma`
- Migrations: `packages/server/prisma/migrations/`

---

## Known Issues & Current State

### ✅ What Works

1. Single balise file upload
2. Version creation on file changes
3. S3 storage with version paths
4. Database version history

### 🔴 What Doesn't Work / Needs Fixing

1. **S3 deletion not implemented**
   - Files stay in S3 even when "deleted"
   - Not a problem with "replace all" approach
2. **Confusing "keep files" UI**
   - Current UI marks files for deletion with strikethrough
   - User must click to keep
   - Should be simplified: just show "replacing X files"
3. **No bulk upload feature**
   - Most critical missing feature
   - Admin users need this for efficient workflow

### 🎯 Top Priority

**Implement bulk upload with filename-based routing**

- Most requested feature
- Matches old tool behavior
- Dramatically improves admin efficiency

---

## Implementation Checklist

### Phase 1: Fix Single Upload UX

- [ ] Remove "keep files" checkbox UI
- [ ] Show simple message: "Uploading new files will replace existing files"
- [ ] Add confirmation: "Replace X existing files?"

### Phase 2: Backend Bulk Upload

- [x] Create `bulk-upload-balises.ts` Lambda
- [x] Implement filename parsing: `parseBaliseId()`
- [x] Implement file grouping: `groupFilesByBalise()`
- [x] Add transaction support: all-or-nothing uploads
- [x] Add error handling: invalid filenames, missing balises

### Phase 3: Frontend Bulk Upload

- [ ] Create `BulkUploadPage.tsx`
- [ ] Multi-file dropzone component
- [ ] File grouping display
- [ ] Progress tracking for each balise
- [ ] Error display: which files failed and why

### Phase 4: Testing

- [ ] Upload single file to single balise
- [ ] Upload multiple files to single balise
- [ ] Bulk upload: 2-3 files each to 3 balises
- [ ] Bulk upload: 50+ files to 20+ balises
- [ ] Error cases: invalid filename, missing balise
- [ ] Verify version history created correctly
- [ ] Verify old files preserved in S3

---

## Examples

### Example 1: Replace 3 Files

```
Balise 10000 currently has:
  v2/10000.il
  v2/10000.leu
  v2/10000.bis

User uploads: 10000.il, 10000.leu, 10000.bis

Result:
  v2/ unchanged (history)
  v3/10000.il  (new)
  v3/10000.leu (new)
  v3/10000.bis (new)
```

### Example 2: Reduce Files

```
Balise 10000 currently has:
  v2/10000.il
  v2/10000.leu
  v2/10000.bis

User uploads: 10000.il, 10000.leu

Result:
  v2/ unchanged (history, has all 3 files)
  v3/10000.il  (new)
  v3/10000.leu (new)
  (10000.bis not in v3, but still in v2)
```

### Example 3: Bulk Upload

```
User uploads:
  10000.il
  10000.leu
  10002.il
  10002.leu
  10002.bis
  12345.il

System groups:
  Balise 10000: [10000.il, 10000.leu]
  Balise 10002: [10002.il, 10002.leu, 10002.bis]
  Balise 12345: [12345.il]

Result:
  Balise 10000 → v3 created
  Balise 10002 → v5 created
  Balise 12345 → v2 created
```

---

## Questions & Decisions

### Q1: What if filename doesn't match any balise?

**Decision:** Show error, don't upload. User must fix filename.

### Q2: What if one balise fails in bulk upload?

**Decision:** Use transaction - rollback all if any fails. Or partial success with clear error report.

### Q3: Should we support keeping some files?

**Decision:** Backend allows it, but UI doesn't offer it. Default is full replacement.

### Q4: File size limits?

**Decision:** TBD. Lambda has 10 MB request limit. May need direct S3 upload with presigned URLs for large files.

### Q5: File type validation?

**Decision:** TBD. Currently accepts any file type. May want to restrict to: .il, .leu, .bis, .pdf, .xlsx

---

**End of Documentation**
