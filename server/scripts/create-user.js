var Sequelize = require('sequelize');
var config = require('../config');
var prompt = require('prompt');
var bcrypt = require('bcrypt-nodejs');
var util = require('util');

require('../db').then((db) => {
	var input = {};

	prompt.start();
	prompt.get({
		properties: {
			firstName: {
				description: 'First Name',
				required: true
			},

			lastName: {
				description: 'Last Name',
				required: true
			},

			password: {
				description: 'Password',
				hidden: true,
				required: true,
				before: function (value) {
					var salt = bcrypt.genSaltSync(15);
					var hash = bcrypt.hashSync(value, salt);

					return hash;
				}
			},

			email: {
				description: 'Email',
				required: true
			},

			mobileNumber: {
				description: 'Phone Number',
				required: true
			}
		}
	}, function (err, results) {
		if (err) {
			process.exit(1);
		} else {
			db.User.build(results).save().then((what) => {
				console.log('User created with id ' + what.id);

				process.exit(0);
			}).catch((err) => {
				console.log(err);
				process.exit(1);
			});
		}
	});
}).catch(function (err) {
	console.log(err);
	process.exit(1);
});