var Sequelize = require('sequelize');

module.exports.init = function (settings) {
	return new Promise(function (resolve, reject) {
		resolve(new Sequelize(settings.database_name, settings.database_user, settings.database_password, settings.sequelize_options));
	});
};