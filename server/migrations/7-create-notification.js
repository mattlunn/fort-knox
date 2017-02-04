'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('notifications', {
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
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			type: {
				type: Sequelize.ENUM('mobile', 'email')
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
		return queryInterface.dropTable('notifications');
	}
};