// AWS DynamoDB configuration
const AWS = require('aws-sdk');
AWS.config.update({
	region: process.env.MY_AWS_REGION,
	accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDB;