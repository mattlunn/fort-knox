var Umzug = require('umzug');
var Sequelize = require('sequelize');
var config = require('../config');
var argv = require('yargs').array('up').array('down').argv;

require('../drivers/' + config.db_driver).init(config.db_settings).then(function (sequelize) {
	var umzug = new Umzug({
		storage: 'sequelize',
		storageOptions: {
			sequelize: sequelize
		},
		migrations: {
			pattern: /^\d+[\w-]+\.js$/,
			params: [sequelize.getQueryInterface(), Sequelize],
			path: __dirname + '/../migrations'
		}
	});

	var promise;

	if (argv.up) {
		promise = umzug.execute({
			migrations: argv.up,
			method: 'up'
		});
	} else if (argv.down) {
		promise = umzug.execute({
			migrations: argv.down,
			method: 'down'
		});
	} else {
		promise = umzug.up();
	}

	return promise.then(function (result) {
		console.log('Done');
		process.exit(0);
	});
}).catch(function (err) {
	console.log(err);
	process.exit(1);
});