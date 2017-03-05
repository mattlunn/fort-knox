'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
 		return queryInterface.addColumn('armings', 'userId', Sequelize.INTEGER);
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('armings', 'userId');
	}
};