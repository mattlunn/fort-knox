var Client = require('ssh2').Client;
var Sequelize = require('sequelize');
var promise = require('promise');
var net = require('net');
var sshConnected = false;
var conn = new Client();

module.exports.init = function (settings) {
	return new Promise(function (resolve, reject) {
		conn.on('ready', function() {
			sshConnected = true;

			resolve(new Sequelize(settings.db.database_name, settings.db.database_user, settings.db.database_password, settings.db.sequelize_options));
		}).on('close', function() {
			sshConnected = false;
		}).connect(settings.ssh);

		net.createServer(function(sock) {
			sock.on('error', function() {});
			if (!sshConnected) return sock.end();
			conn.forwardOut(
				'127.0.0.1',
				sock.remotePort,
				'127.0.0.1',
				3306,
				function (err, stream) {
					if (err) return sock.end();
					stream.pipe(sock).pipe(stream);
				});
		}).listen(3306);
	});
};