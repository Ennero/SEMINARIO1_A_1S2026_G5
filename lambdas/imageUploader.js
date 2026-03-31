const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Lambda function to upload a base64-encoded image to an S3 bucket.
 * Expected API Gateway event body:
 * {
 *   "image": "<base64-encoded image string>",
 *   "fileName": "example.jpg",
 *   "contentType": "image/jpeg"
 * }
 */
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { image, fileName, contentType } = body;

    if (!image || !fileName || !contentType) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'image, fileName, and contentType are required' }),
      };
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'S3_BUCKET_NAME environment variable is not configured' }),
      };
    }

    const buffer = Buffer.from(image, 'base64');
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    const params = {
      Bucket: bucketName,
      Key: `uploads/${Date.now()}-${safeFileName}`,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Image uploaded successfully',
        key: params.Key,
        bucket: bucketName,
      }),
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
