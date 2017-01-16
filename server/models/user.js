var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('user', {
		firstName: {
			type: Sequelize.STRING,
			field: 'first_name'
		},
		lastName: {
			type: Sequelize.STRING,
			field: 'last_name'
		},
		email: {
			type: Sequelize.STRING,
		},
		password: {
			type: Sequelize.STRING,
		}
	});
};