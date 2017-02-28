'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('recordings', 'recording').then(() => {
	 		return queryInterface.addColumn('recordings', 'recording', Sequelize.STRING);
		});
	},
	down: function(queryInterface, Sequelize) {
	 	return queryInterface.addColumn('recordings', 'recording', Sequelize.BLOB('medium')).then(() => {
			return queryInterface.removeColumn('recordings', 'recording');
		});
	}
};