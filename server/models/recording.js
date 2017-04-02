var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('recording', {
		eventId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		recording: {
			type: Sequelize.STRING,
			allowNull: false
		},
		start: {
			type: Sequelize.DATE,
			allowNull: false
		},
		end: {
			type: Sequelize.DATE,
			allowNull: false
		},
		size: {
			type: Sequelize.INTEGER.UNSIGNED
		}
	});
};