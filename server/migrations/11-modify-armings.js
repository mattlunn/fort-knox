'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
 		return queryInterface.renameColumn('armings', 'userId', 'startedByUserId').then(() => {
 			return queryInterface.addColumn('armings', 'endedByUserId', Sequelize.INTEGER);
 		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.renameColumn('armings', 'startedByUserId', 'userId').then(() => {
 			return queryInterface.removeColumn('armings', 'endedByUserId');
 		});
	}
};