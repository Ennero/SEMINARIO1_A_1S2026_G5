const {
  RekognitionClient,
  CompareFacesCommand,
  DetectLabelsCommand,
} = require('@aws-sdk/client-rekognition');

const { normalizeBase64 } = require('./imageUpload');

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
});

function getBucketFromImageUrl(imageUrl) {
  const parsed = new URL(imageUrl);
  const hostParts = parsed.hostname.split('.');
  return hostParts[0];
}

function getKeyFromImageUrl(imageUrl) {
  const parsed = new URL(imageUrl);
  return decodeURIComponent(parsed.pathname.replace(/^\//, ''));
}

async function compareFaceWithProfileImage({ imageBase64, profileImageUrl, threshold = 90 }) {
  const sourceBytes = Buffer.from(normalizeBase64(imageBase64), 'base64');
  const bucket = getBucketFromImageUrl(profileImageUrl);
  const key = getKeyFromImageUrl(profileImageUrl);

  const command = new CompareFacesCommand({
    SourceImage: { Bytes: sourceBytes },
    TargetImage: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    SimilarityThreshold: threshold,
  });

  const response = await rekognitionClient.send(command);
  const maxSimilarity = (response.FaceMatches || []).reduce((highest, match) => {
    return Math.max(highest, match.Similarity || 0);
  }, 0);

  return {
    matches: response.FaceMatches || [],
    maxSimilarity,
  };
}

async function detectLabelsFromImageUrl({ imageUrl, maxLabels = 15, minConfidence = 70 }) {
  const bucket = getBucketFromImageUrl(imageUrl);
  const key = getKeyFromImageUrl(imageUrl);

  const command = new DetectLabelsCommand({
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    MaxLabels: maxLabels,
    MinConfidence: minConfidence,
  });

  const response = await rekognitionClient.send(command);
  return (response.Labels || []).map((label) => ({
    name: label.Name,
    confidence: label.Confidence,
  }));
}

async function detectLabelsFromImageBase64({ imageBase64, maxLabels = 15, minConfidence = 70 }) {
  const command = new DetectLabelsCommand({
    Image: {
      Bytes: Buffer.from(normalizeBase64(imageBase64), 'base64'),
    },
    MaxLabels: maxLabels,
    MinConfidence: minConfidence,
  });

  const response = await rekognitionClient.send(command);
  return (response.Labels || []).map((label) => ({
    name: label.Name,
    confidence: label.Confidence,
  }));
}

module.exports = {
  compareFaceWithProfileImage,
  detectLabelsFromImageUrl,
  detectLabelsFromImageBase64,
};
