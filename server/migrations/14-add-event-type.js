'use strict';

module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.addColumn('events', 'type', Sequelize.ENUM('motion', 'disconnection', 'connection'), {
			allowNull: false,
			defaultValue: 'motion'
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('events', 'type');
	}
};