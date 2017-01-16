var Sequelize = require('sequelize');

module.exports.create = function (sequelize) {
	return sequelize.define('arming', {
		start: {
			type: Sequelize.DATE
		},
		end: {
			type: Sequelize.DATE
		}
	});
};