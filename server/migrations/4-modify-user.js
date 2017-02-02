'use strict';

module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.addColumn('users', 'email', Sequelize.STRING).then(() => {
			return queryInterface.removeColumn('users', 'salt');
		}).then(() => {
			return queryInterface.addIndex('users', ['email'], {
				indexName: 'email_unique',
				indicesType: 'UNIQUE'
			});
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.removeIndex('users', 'email_unique').then(() => {
			return queryInterface.removeColumn('users', 'email');
		}).then(() => {
			return queryInterface.addColumn('users', 'salt', Sequelize.STRING);
		});
	}
};