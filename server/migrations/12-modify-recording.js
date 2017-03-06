'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
 		return queryInterface.addColumn('recordings', 'size', Sequelize.INTEGER.UNSIGNED);
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('recordings', 'size');
	}
};