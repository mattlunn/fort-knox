var config = require('./config.json');

module.exports = new Promise(function (resolve, reject) {
	require('./drivers/' + config.db_driver).init(config.db_settings).then(function (sequelize) {
		var User = require('./models/user').create(sequelize);
		var Event = require('./models/event').create(sequelize);
		var Recording = require('./models/recording').create(sequelize);
		var Camera = require('./models/camera').create(sequelize);
		var Arming = require('./models/arming').create(sequelize);
		var Notification = require('./models/notification').create(sequelize);

		Event.belongsTo(Camera, { foreign_key: 'cameraId' });
		Notification.belongsTo(Event, { foreign_key: 'eventId'});
		Notification.belongsTo(User, { foreign_key: 'userId'});
		Recording.belongsTo(Event, { foreign_key: 'eventId'});
		Event.hasOne(Recording, { foreign_key: 'eventId'});
		Arming.belongsTo(User, { foreign_key: 'userId' });

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