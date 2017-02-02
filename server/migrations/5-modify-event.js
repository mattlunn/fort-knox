'use strict';

module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.addColumn('events', 'cameraId', Sequelize.INTEGER);
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('events', 'cameraId');
	}
};