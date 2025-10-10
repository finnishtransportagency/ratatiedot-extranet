# Balise File Upload Implementation - Complete ✅

## Overview

Implemented complete file upload/download functionality for balises using S3 storage with hierarchical folder structure.

## Architecture

### Storage Structure

```
S3 Bucket: balisesBucket
Path: balise_{secondaryId}/v{version}/{filename}

Example:
  balise_12345/v1/datasheet.pdf
  balise_12345/v1/diagram.png
  balise_12345/v2/datasheet.pdf  (new version)
  balise_12345/v2/updated-diagram.png
```

### File Upload Flow (One File at a Time)

1. **Frontend** collects multiple files in form
2. **Frontend** first sends metadata-only request to create/update balise
3. **Frontend** then sends each file individually via multipart/form-data
4. **Backend** detects content-type and handles accordingly:
   - `application/json` → metadata update only
   - `multipart/form-data` → file upload + metadata update
5. **Backend** uploads file to S3 with hierarchical path
6. **Backend** auto-detects file type and adds to `fileTypes` array
7. **Backend** creates version history entry on each update

## Implementation Details

### Backend Changes

#### 1. Infrastructure (CDK) ✅

**File**: `lib/rataextra-stack.ts`

```typescript
// Created S3 bucket with encryption and versioning
const balisesBucket = new Bucket(this, 'rataextra-balises-', {
  encryption: BucketEncryption.S3_MANAGED,
  versioned: true,
  publicReadAccess: false,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
});
```

**File**: `lib/rataextra-backend.ts`

```typescript
// Granted permissions to Lambda functions
balisesBucket.grantReadWrite(addBalise);
balisesBucket.grantRead(getBalise, getBalises, getBaliseDownloadUrl);
balisesBucket.grantDelete(deleteBalise);

// Added environment variable
environment: {
  BALISES_BUCKET_NAME: balisesBucket.bucketName,
  // ...other vars
}
```

#### 2. Upload Lambda ✅

**File**: `packages/server/lambdas/balise/add-balise.ts`

**Features**:

- Handles both JSON (metadata only) and multipart/form-data (file upload)
- Auto-detects file type from extension
- Uploads to S3 with hierarchical path: `balise_{id}/v{version}/{filename}`
- Updates `fileTypes` array automatically
- Creates version history on each update
- Uses existing `uploadToS3` utility from `s3utils.ts`

**API Usage**:

```bash
# Metadata only (JSON)
PUT /api/balise/12345/add
Content-Type: application/json
Body: { "description": "Updated", "bucketId": "balise-12345" }

# File upload (multipart)
PUT /api/balise/12345/add
Content-Type: multipart/form-data
Body:
  - file: <binary data>
  - baliseData: '{"description": "Updated"}'  (optional)
```

#### 3. Download Lambda ✅

**File**: `packages/server/lambdas/balise/get-balise-download-url.ts`

**Features**:

- Generates presigned S3 URLs (1 hour expiration)
- Uses hierarchical path structure
- Uses existing AWS SDK v2 (same as image uploads)

**API Usage**:

```bash
GET /api/balise/12345/download?fileType=pdf

Response:
{
  "downloadUrl": "https://...",
  "expiresIn": 3600,
  "fileKey": "balise_12345/v5/document.pdf",
  "baliseId": 12345
}
```

### Frontend Changes

#### 1. Form Component ✅

**File**: `packages/frontend/src/pages/Balise/BaliseForm.tsx`

**Changes**:

- Updated `onSave` callback to accept files parameter
- Modified `handleSave` to pass files array to parent
- Auto-detects file types from uploaded files
- Displays file list with delete option

#### 2. Edit Page ✅

**File**: `packages/frontend/src/pages/Balise/BaliseEditPage.tsx`

**Changes**:

- Added `uploadFileToBalise` function for single file upload
- Updated `handleSave` to:
  1. First save/update metadata (JSON request)
  2. Then upload each file individually (multipart requests)
- Loops through files array and uploads one by one

**Flow**:

```javascript
// 1. Create/update balise (metadata only)
const balise = await saveBalise(metadata);

// 2. Upload files one by one
for (const file of files) {
  await uploadFileToBalise(balise.secondaryId, file);
}
```

## Testing Checklist

### Backend

- [ ] Deploy to feat environment
- [ ] Verify S3 bucket created
- [ ] Verify Lambda has BALISES_BUCKET_NAME env var
- [ ] Test metadata-only update (JSON)
- [ ] Test file upload (multipart)
- [ ] Test download URL generation
- [ ] Verify files appear in S3 with correct path structure
- [ ] Verify fileTypes array updates correctly
- [ ] Verify version history is created

### Frontend

- [ ] Test create new balise without files
- [ ] Test create new balise with files
- [ ] Test update balise metadata only
- [ ] Test update balise with new files
- [ ] Test file type auto-detection
- [ ] Test file upload progress/errors
- [ ] Test download file from version history
- [ ] Verify multiple files upload sequentially

## Database Schema (Reference)

```prisma
model Balise {
  id          String          @id @default(uuid())
  secondaryId Int             @unique
  version     Int
  description String
  bucketId    String
  fileTypes   String[]        // Auto-populated from uploaded files
  history     BaliseVersion[]
  createdBy   String
  createdTime DateTime        @default(now())
  locked      Boolean         @default(false)
  lockedBy    String?
  lockedTime  DateTime?
  deletedAt   DateTime?
  deletedBy   String?
}

model BaliseVersion {
  id                 String   @id @default(uuid())
  baliseId           String
  balise             Balise   @relation(fields: [baliseId], references: [id])
  secondaryId        Int
  version            Int
  description        String
  bucketId           String
  fileTypes          String[]
  createdBy          String
  createdTime        DateTime
  versionCreatedTime DateTime @default(now())
  // ... lock fields
}
```

## API Endpoints Summary

| Endpoint                    | Method | Purpose                | Request Type        |
| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/balise/{id}/add`      | PUT    | Create/update metadata | application/json    |
| `/api/balise/{id}/add`      | PUT    | Upload file            | multipart/form-data |
| `/api/balise/{id}/download` | GET    | Get presigned URL      | -                   |
| `/api/balise/{id}`          | GET    | Get balise details     | -                   |
| `/api/balise`               | GET    | List balises           | -                   |

## Key Design Decisions

### ✅ One File at a Time

- **Pros**: Works with existing `parseForm` utility, simpler implementation, better progress tracking
- **Cons**: Multiple HTTP requests for multiple files
- **Rationale**: Existing infrastructure already uses this pattern for images

### ✅ Folder Structure vs S3 Versioning

- **Choice**: Hierarchical folder structure `balise_{id}/v{version}/`
- **Rationale**: Application already has explicit versioning, folder structure provides easier querying and aligns with business logic

### ✅ Reuse Existing AWS SDK v2

- **Choice**: Use existing `s3utils.ts` and AWS SDK v2
- **Rationale**: Already in use, no new dependencies needed, consistent with image upload pattern

### ✅ Auto-detect File Types

- **Choice**: Extract file extension and add to `fileTypes` array automatically
- **Rationale**: Reduces manual work, prevents errors, provides quick overview without S3 query

## Next Steps (Frontend TODO)

1. **Implement download functionality**

   - Call `/api/balise/{id}/download?fileType={ext}` endpoint
   - Open presigned URL in new tab or trigger download

2. **Add file upload progress indicator**

   - Show progress for each file being uploaded
   - Handle upload errors gracefully

3. **Add file preview/icons**

   - Show file type icons (PDF, PNG, etc.)
   - Preview images inline if possible

4. **Optimize UX**
   - Show upload progress
   - Batch status updates
   - Better error messages

## Notes

- Lambda payload limit: 6MB (synchronous), so large files should be split or use direct S3 upload
- Presigned URLs expire after 1 hour
- S3 bucket has versioning enabled as backup mechanism
- All uploads require write permissions (validated via `validateWriteUser`)
- All downloads require read permissions (validated via `validateReadUser`)
