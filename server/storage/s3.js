var uuid = require('uuid/v4');
var AwsS3Client = require('aws-sdk/clients/s3');

function S3(options) {
	this.client = new AwsS3Client({
		apiVersion: '2006-03-01',
		accessKeyId: options.access_key_id,
		secretAccessKey: options.secret_access_key,
		sslEnabled: true,
		params: {
			Bucket: options.bucket_name
		},
		region: options.bucket_region
	});
}

S3.prototype.store = function (buffer) {
	var id = uuid();

	return new Promise((resolve, reject) => {
		this.client.upload({
			Body: buffer,
			ContentType: 'video/mp4',
			Key: id
		}, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(id);
			}
		});
	});
};

S3.prototype.serve = function (handle) {
	return new Promise((resolve, reject) => {
		this.client.getObject({
			Key: handle
		}, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data.Body);
			}
		});
	});
};

module.exports.init = function (options) {
	return Promise.resolve(new S3(options));
};