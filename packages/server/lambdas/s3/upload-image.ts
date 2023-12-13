import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const RATAEXTRA_STACK_IDENTIFIER = process.env.RATAEXTRA_STACK_IDENTIFIER;

export const uploadImage = async (file: Buffer, fileName: string): Promise<string> => {
  const params = {
    Bucket: `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`,
    Key: fileName,
    Body: file,
    ACL: 'private',
  };

  try {
    await s3.upload(params).promise();
    const url = `https://${RATAEXTRA_STACK_IDENTIFIER}-images.s3.eu-west-1.amazonaws.com/${fileName}`;
    return url;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};
