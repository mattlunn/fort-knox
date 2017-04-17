var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('event', {
		timestamp: {
			type: Sequelize.DATE
		},

		type: {
			type: Sequelize.ENUM('motion', 'disconnection', 'connection')
		}
	});
};