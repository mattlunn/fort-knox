var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('camera', {
		friendlyName: {
			type: Sequelize.STRING
		},
		machineName: {
			type: Sequelize.STRING
		}
	});
};