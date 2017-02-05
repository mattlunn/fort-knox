var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('notification', {
		eventId: {
			type: Sequelize.INTEGER
		},
		userId: {
			type: Sequelize.INTEGER
		},
		type: {
			type: Sequelize.ENUM('text', 'email')
		}
	});
};