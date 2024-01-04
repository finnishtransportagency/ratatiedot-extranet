import { S3 } from 'aws-sdk';
const s3 = new S3();

export async function uploadToS3(bucket: string, fileName: string, fileData: Buffer) {
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: fileData,
    ACL: 'private',
  };

  await s3.upload(params).promise();
}

// a function to delete a file from S3
export async function deleteFromS3(bucket: string, fileName: string) {
  const params = {
    Bucket: bucket,
    Key: fileName,
  };

  await s3.deleteObject(params).promise();
}
