const aws = require('aws-sdk');
const logger = require('../utils/logger');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadFile = async (file) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    logger.info(`File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw error;
  }
};

module.exports = { uploadFile };
