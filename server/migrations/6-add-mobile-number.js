'use strict';

module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.addColumn('users', 'mobileNumber', Sequelize.STRING);
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('events', 'mobileNumber');
	}
};