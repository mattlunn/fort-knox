var config = require('./config.json');

module.exports = new Promise(function (resolve, reject) {
	require('./drivers/' + config.db_driver).init(config.db_settings).then(function (sequelize) {
		var User = require('./models/user').create(sequelize);
		var Event = require('./models/event').create(sequelize);
		var Recording = require('./models/recording').create(sequelize);
		var Camera = require('./models/camera').create(sequelize);
		var Arming = require('./models/arming').create(sequelize);
		var Notification = require('./models/notification').create(sequelize);

		Event.belongsTo(Camera);
		Notification.belongsTo(Event);
		Notification.belongsTo(User);
		Recording.belongsTo(Event);
		Event.hasOne(Recording);

		User.hasMany(Arming, { as: 'startedByUser', foreignKey: 'startedByUserId' });
		User.hasMany(Arming, { as: 'endedByUser', foreignKey: 'endedByUserId' });

		Arming.belongsTo(User, { as: 'startedByUser', foreignKey: 'startedByUserId' });
		Arming.belongsTo(User, { as: 'endedByUser', foreignKey: 'endedByUserId' });

		resolve({
			User: User,
			Event: Event,
			Camera: Camera,
			Arming: Arming,
			Notification: Notification,
			Recording: Recording
		});
	}).catch((err) => {
		reject(err);
	});
});