function Client(client, sendingNumber) {
	this.client = client;
	this.notify = function (to, body) {
		var that = this;

		return new Promise(function (resolve, reject) {
			console.log('Sending "' + body + '" to "' + to + '"');

			that.client.messages.create({
				body: body,
				to: to,
				from: sendingNumber
			}, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	};
}

module.exports = new Promise(function (resolve, reject) {
	var config = require('../config.json').twilio;
	var twilio = require('twilio');

	resolve(new Client(twilio(config.account_sid, config.auth_token), config.sending_number));
});