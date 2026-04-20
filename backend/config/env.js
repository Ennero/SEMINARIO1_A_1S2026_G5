const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'AWS_REGION',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
];

function validateRequiredEnv() {
  const missing = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);

  if (!process.env.S3_BUCKET_IMAGES && !process.env.S3_BUCKET_NAME) {
    missing.push('S3_BUCKET_IMAGES (or S3_BUCKET_NAME)');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  validateRequiredEnv,
};
