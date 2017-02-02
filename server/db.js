var config = require('./config.json');

module.exports = new Promise(function (resolve, reject) {
	require('./drivers/' + config.db_driver).init(config.db_settings).then(function (sequelize) {
		var User = require('./models/user').create(sequelize);
		var Event = require('./models/event').create(sequelize);
		var Camera = require('./models/camera').create(sequelize);
		var Arming = require('./models/arming').create(sequelize);

		Event.belongsTo(Camera, { foreign_key: 'camera_id' });
		Camera.hasMany(Event, { foreign_key: 'camera_id' });

		resolve({
			User: User,
			Event: Event,
			Camera: Camera,
			Arming: Arming
		});
	});
});