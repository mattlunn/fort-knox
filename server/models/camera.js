var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('camera', {
		friendlyName: {
			type: Sequelize.STRING,
			field: 'friendly_name'
		},
		machineName: {
			type: Sequelize.STRING,
			field: 'machineName'
		}
	});
};