'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
 		return queryInterface.addIndex('events', ['timestamp']).then(() => {
	 		return queryInterface.addIndex('armings', ['start']);
 		}).then(() => {
	 		return queryInterface.addIndex('armings', ['end']);
 		}).then(() => {
	 		return queryInterface.addIndex('recordings', ['eventId']);
 		});
	},
	down: function(queryInterface, Sequelize) {
 		return queryInterface.removeIndex('events', ['timestamp']).then(() => {
	 		return queryInterface.removeIndex('armings', ['start']);
 		}).then(() => {
	 		return queryInterface.removeIndex('armings', ['end']);
 		}).then(() => {
	 		return queryInterface.removeIndex('recordings', ['eventId']);
 		});
	}
};