var util = require('util');
var uuid = require('uuid/v4');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var moment = require('moment');
var multer = require('multer');
var path = require('path');
var _ = require('underscore');
var config = require('./config');
var app = express();
var api = express();

Promise.all([
	require('./notifiers/twilio'),
	require('./db'),
	require('./storage/' + config.storage_provider).init(config.storage_settings)
]).then(([twilio, db, storage]) => {
	function authenticate(req, res, next) {
		if (req.session.userId || req.query.token === config.api_key) {
			next();
		} else {
			res.status(401).end();
		}
	}

	app.use(session({
		secret: config.cookie_secret,
		saveUninitialized: false,
		resave: false
	}));

	app.use('/static', express.static('../website/build/static'));
	app.use('/api', api);

	app.get('/favicon.ico', (req, res) => {
		res.end();
	});

	app.use(function (req, res) {
		res.sendFile(path.join(__dirname, '../website/build/', 'index.html'));
	});

	api.use(bodyParser.urlencoded({ extended: false }));

	api.post('/authenticate', function (req, res) {
		if (!['username', 'password'].every(x => typeof req.body[x] === 'string')) {
			res.status(400).end();
		} else {
			db.User.findByCredentials(req.body.username, req.body.password).then(function (user) {
				req.session.userId = user.id;
				res.json({
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName
				}).end();
			}, function () {
				res.status(400).end();
			});
		}
	});

	api.use(authenticate);

	api.get('/recording/:id', function (req, res, next) {
		return db.Recording.findOne({
			where: {
				id: req.params.id
			},
			include: [db.Event]
		}).then((recording) => {
			if (recording == null)
				return Promise.reject('route');

			return storage.serve(recording.recording).then((file) => {
				res.type('video/mp4');

				if (req.query.download === 'true') {
					res.setHeader('Content-disposition', 'attachment; filename=' + moment(recording.event.timestamp).format('YYYY-MM-DD HH:mm:ss'));
				}

				res.end(file);
			});
		}).catch(next);
	});

	api.post('/event', multer({ storage: multer.memoryStorage() }).single('recording'), function (req, res, next) {
		var name = req.body.device || 'default';
		var now = req.body.timestamp ? moment.unix(req.body.timestamp) : moment();

		Promise.all([
			// Create an event...
			db.Camera.findOne({
				where: {
					machineName: name
				}
			}).then(function (camera) {
				return camera || db.Camera.build({
					machineName: name,
					friendlyName: name
				}).save();
			}).then(function (camera) {
				return db.Event.build({
					timestamp: now.toDate(),
					cameraId: camera.id
				}).save();
			}),

			// Figure out if we're armed or not. If so, load the users which need to be
			// notified...
			db.Arming.findOne({
				order: [['start', 'DESC']]
			}).then(function (arming) {
				if (arming && (!arming.end || moment(arming.end).isAfter(now))) {
					return db.User.findAll({
						where: {
							mobileNumber: {
								$ne: null
							}
						}
					});
				}

				return [];
			})
		]).then(function (promises) {
			var [event, users] = promises;

			return Promise.all([
				(function () {
					if (req.file) {
						return storage.store(req.file.buffer).then((handle) => {
							return db.Recording.build({
								eventId: event.id,
								recording: handle,
								start: moment(now.subtract(10, 's')).toDate(),
								end: now.toDate()
							}).save();
						});
					}
				}()),

				Promise.all(users.map((user) => {
					return twilio.notify(
						user.mobileNumber,
						util.format(
							'Hi %s. Sorry to be the bearer of bad news, but your device "%s" has detected motion at %s, soooooo, you might be getting burgled...',
							user.firstName,
							name,
							now.format('HH:mm:ss')
						)
					).then(() => {
						return db.Notification.build({
							userId: user.id,
							eventId: event.id,
							type: 'mobile'
						}).save();
					})
				}))
			]);
		}).then(() => {
			res.end();
		}).catch(next);
	});

	api.post('/armed', function (req, res) {
		var now = moment();
		var arm = req.body.armed === 'true';

		db.Arming.findOne({
			order: [['start', 'DESC']]
		}).then(function (arming) {
			// If arming and there is either no arming, or the latest arming is already over, then create a new one..
			if (arm && (!arming || moment(arming.end).isBefore(now))) {
				return db.Arming.build({
					start: new Date()
				}).save();

			// Otherwise, if we're ending arming and there is an arming, and either end isn't set or is set till later...
			} else if (!arm && arming && (!arming.end || moment(arming.end).isAfter(now))) {
				arming.end = new Date();
				return arming.save();
			}
		}).then(function () {
			res.json(arm).end();
		}, function (err) {
			res.status(500).end(err);
		});
	});

	api.get('/armed', function (req, res) {
		var now = moment();

		db.Arming.findOne({
			order: [['start', 'DESC']]
		}).then(function (arming) {
			res.json(arming && (!arming.end || moment(arming.end).isAfter(now))).end();
		}, function (err) {
			res.status(500).end(err);
		});
	});

	api.get('/history', function (req, res, next) {
		function dictionaryGenerator(key) {
			return function (array) {
				var dictionary = {};

				for (var i=0;i<array.length;i++) {
					dictionary[array[i][key]] = array[i];
				}

				return dictionary;
			}
		}

		Promise.all([
			db.Event.findAll({
				include: [db.Recording],
				order: [['timestamp', 'ASC']]
			}),

			db.Arming.findAll({
				order: [['start', 'ASC']]
			}),

			db.User.findAll().then(dictionaryGenerator('id')),
			db.Camera.findAll().then(dictionaryGenerator('id'))
		]).then(function ([events, armings, usersLookup, camerasLookup]) {
			var lastEventTimestamp = moment.unix(0);
			var isArmed = false;
			var output = [];

			function outputArmingsAndDisarmingsBetween(from, to) {
				for (var i=0;i<armings.length;i++) {
					var thisArming = armings[i];
					var thisArmingStart = moment(thisArming.start);
					var thisArmingEnd = moment(thisArming.end);
					var thisArmingUser = usersLookup[thisArming.userId];

					if (thisArmingStart.isAfter(from) && thisArmingStart.isBefore(to)) {
						output.push({
							type: 'ARMING',
							timestamp: thisArmingStart.toISOString(),
							user: {
								id: thisArmingUser.id,
								firstName: thisArmingUser.firstName
							}
						});
						isArmed = true;
					}

					if (thisArmingEnd.isAfter(from) && thisArmingEnd.isBefore(to)) {
						output.push({
							type: 'DISARMING',
							timestamp: thisArmingEnd.toISOString(),
							user: {
								id: thisArmingUser.id,
								firstName: thisArmingUser.firstName
							}
						});
						isArmed = false;
					}
				}
			}

			for (var event of events) {
				var eventTimestamp = moment(event.timestamp);
				var eventCamera = camerasLookup[event.cameraId];

				outputArmingsAndDisarmingsBetween(lastEventTimestamp, eventTimestamp);
				output.push({
					id: event.id,
					type: 'EVENT',
					timestamp: eventTimestamp.toISOString(),
					device: {
						id: eventCamera.id,
						name: eventCamera.friendlyName
					},
					isArmed: isArmed,
					recording: event.recording ? {
						id: event.recording.id
					} : null
				});

				lastEventTimestamp = eventTimestamp;
			}

			outputArmingsAndDisarmingsBetween(lastEventTimestamp, moment());
			res.json(output.reverse()).end();
		}).catch(next);
	});

	api.use(function (req, res, next) {
		res.status(404).end();
	});

	app.use(function (err, req, res, next) {
		var error = 'An unknown error has occurred';

		if (err instanceof Error) {
			console.log(err.stack);

			error = err.message;
		} else if (typeof err === 'string') {
			error = err;
		} else if (typeof err === 'object' && err !== null) {
			error = err.message;
		}

		console.log(error);
		res.status(500).send(error);
	})

	app.listen(config.port, function () {
		console.log('Example app listening on port ' + config.port + '!');
	});
}, (err) => {
	console.log(err);
});