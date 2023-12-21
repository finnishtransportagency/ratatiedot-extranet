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
