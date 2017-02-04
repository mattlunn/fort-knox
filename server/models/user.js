var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

module.exports.create = function (sequelize) {
	var user = sequelize.define('user', {
		firstName: {
			type: Sequelize.STRING
		},
		lastName: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING
		},
		password: {
			type: Sequelize.STRING
		},
		mobileNumber: {
			type: Sequelize.STRING
		}
	});

	user.findByCredentials = function (email, password) {
		return this.findOne({
			where: {
				email: email
			}
		}).then(user => {
			if (user && bcrypt.compareSync(password, user.password)) {
				return user;
			}

			return Promise.reject();
		});
	};

	return user;
};