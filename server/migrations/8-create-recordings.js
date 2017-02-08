'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('recordings', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			eventId: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			recording: {
				type: Sequelize.BLOB('medium'),
				allowNull: false
			},
			start: {
				type: Sequelize.DATE,
				allowNull: false
			},
			end: {
				type: Sequelize.DATE,
				allowNull: false
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.dropTable('recordings');
	}
};