const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

function getImageBucket() {
  return process.env.S3_BUCKET_IMAGES || process.env.S3_BUCKET_NAME;
}

function normalizeBase64(base64Input) {
  return String(base64Input || '').replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

function buildS3Url(bucket, key) {
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

function sanitizeFileName(fileName) {
  return String(fileName || 'profile.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadViaApiGateway({ imageBase64, fileName, contentType }) {
  const uploadApiUrl = process.env.IMAGE_UPLOAD_API_URL;
  if (!uploadApiUrl) {
    return null;
  }

  const payload = {
    image: normalizeBase64(imageBase64),
    fileName,
    contentType,
  };

  const response = await fetch(uploadApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`IMAGE_UPLOAD_API_URL request failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  if (data.url) {
    return data.url;
  }

  if (data.bucket && data.key) {
    return buildS3Url(data.bucket, data.key);
  }

  if (data.key) {
    return buildS3Url(getImageBucket(), data.key);
  }

  throw new Error('IMAGE_UPLOAD_API_URL response does not include a valid key/url');
}

async function uploadDirectlyToS3({ imageBase64, fileName, contentType, email, prefix = 'uploads' }) {
  const bucket = getImageBucket();
  const safeFileName = sanitizeFileName(fileName);
  const safeEmail = String(email || 'user').replace(/[^a-zA-Z0-9._-]/g, '_');
  const safePrefix = String(prefix || 'uploads').replace(/[^a-zA-Z0-9/_-]/g, 'uploads');
  const key = `${safePrefix}/${safeEmail}-${Date.now()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(normalizeBase64(imageBase64), 'base64'),
    ContentType: contentType || 'image/jpeg',
  });

  await s3Client.send(command);
  return buildS3Url(bucket, key);
}

async function uploadImageAsset({ imageBase64, fileName, contentType, email, prefix = 'uploads' }) {
  const urlFromApiGateway = await uploadViaApiGateway({
    imageBase64,
    fileName,
    contentType,
  }).catch((error) => {
    console.warn('Upload through API Gateway failed, falling back to direct S3 upload:', error.message);
    return null;
  });

  if (urlFromApiGateway) {
    return urlFromApiGateway;
  }

  return uploadDirectlyToS3({ imageBase64, fileName, contentType, email, prefix });
}

async function uploadProfileImage({ imageBase64, fileName, contentType, email }) {
  return uploadImageAsset({
    imageBase64,
    fileName,
    contentType,
    email,
    prefix: 'profiles',
  });
}

module.exports = {
  uploadImageAsset,
  uploadProfileImage,
  normalizeBase64,
};
