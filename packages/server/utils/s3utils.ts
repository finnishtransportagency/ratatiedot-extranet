const AWS = require('aws-sdk'); //eslint-disable-line @typescript-eslint/no-var-requires
const s3 = new AWS.S3();

export async function uploadToS3(bucket: string, fileName: string, fileData: Buffer) {
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: fileData,
    ACL: 'private',
  };

  await s3.upload(params).promise();
}
