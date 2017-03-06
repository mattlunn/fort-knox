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

	//api.use(authenticate);

	api.get('/recording/:id', function (req, res, next) {
		db.Recording.findOne({
			where: {
				id: req.params.id
			},
			include: [db.Event]
		}).then((recording) => {
			if (recording == null)
				return Promise.reject('route');

			var range = req.range(recording.size)[0];
			var chunk = range.end - range.start;

			res.writeHead(range ? 206 : 200, {
				'Accept-Ranges': 'bytes',
				'Content-Type': 'video/mp4',
				'Content-Range': 'bytes ' + range.start + '-' + range.end + '/' + recording.size,
				'Content-Length': chunk
			})

			return storage.serve(recording.recording, range.start, range.end).then((file) => {
				if (req.query.download === 'true') {
					res.download(moment(recording.event.timestamp).format('YYYY-MM-DD HH:mm:ss') + '.mp4');
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
								size: req.file.length,
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
					start: new Date(),
					startedByUserId: req.session.userId
				}).save();

			// Otherwise, if we're ending arming and there is an arming, and either end isn't set or is set till later...
			} else if (!arm && arming && (!arming.end || moment(arming.end).isAfter(now))) {
				arming.end = new Date();
				arming.endedByUserId = req.session.userId;

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
		var amount = isNaN(Number(req.params.limit))
			? 50
			: Number(req.params.limit);

		var timestamp = isNaN(Number(req.params.timestamp))
			? moment()
			: moment.unix(Number(req.params.timestamp));

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
			Promise.all([
				db.Event.findAll({
					include: [db.Recording],
					order: [['timestamp', 'DESC']],
					limit: amount,
					where: {
						timestamp: {
							$lt: timestamp.toDate()
						}
					}
				}),

				db.Arming.findAll({
					order: [['start', 'DESC']],
					limit: Math.ceil(amount / 2),
					where: {
						start: {
							$lt: timestamp.toDate()
						}
					}
				})
			]).then(([events, armings]) => {
				var eventsTimestamps = events.map(x => moment(x.timestamp));
				var armingsTimestamps = armings.reduce((ar, curr) => ar.push(moment(curr.end || new Date()), moment(curr.start)) && ar, []);
				var eventsIdx = eventsTimestamps.length -1;
				var armingsIdx = armingsTimestamps.length - 1;
				var max = Math.min(eventsTimestamps.length + armingsTimestamps.length, amount);

				while (eventsIdx + 1 + armingsIdx + 1 !== max) {
					if (eventsTimestamps[eventsIdx].isBefore(armingsTimestamps[armingsIdx])) {
						eventsIdx--;
					} else {
						armingsIdx--;
					}
				}

				events.splice(eventsIdx + 1);
				armings.splice(Math.floor(armingsIdx / 2) + 1);

				return [
					events,
					armings,
					armingsIdx % 2 === 0,
					eventsTimestamps[eventsIdx].isBefore(armingsTimestamps[armingsIdx]) ? eventsTimestamps[eventsIdx] : armingsTimestamps[armingsIdx]
				];
			}),

			db.User.findAll().then(dictionaryGenerator('id')),
			db.Camera.findAll().then(dictionaryGenerator('id'))
		]).then(function ([[events, armings, isArmed, lastEventTimestamp], usersLookup, camerasLookup]) {
			var output = [];

			function outputArmingsAndDisarmingsBetween(from, to) {
				for (var i=0;i<armings.length;i++) {
					var thisArming = armings[i];
					var thisArmingStart = moment(thisArming.start);
					var thisArmingEnd = moment(thisArming.end);

					if (thisArmingStart.isSameOrAfter(from) && thisArmingStart.isBefore(to)) {
						output.push({
							type: 'ARMING',
							timestamp: thisArmingStart.toISOString(),
							user: {
								id: usersLookup[thisArming.startedByUserId].id,
								firstName: usersLookup[thisArming.startedByUserId].firstName
							}
						});
						isArmed = true;
					}

					if (thisArmingEnd.isSameOrAfter(from) && thisArmingEnd.isBefore(to)) {
						output.push({
							type: 'DISARMING',
							timestamp: thisArmingEnd.toISOString(),
							user: {
								id: usersLookup[thisArming.endedByUserId].id,
								firstName: usersLookup[thisArming.endedByUserId].firstName
							}
						});
						isArmed = false;
					}
				}
			}

			for (var i=events.length-1;i>=0;i--) {
				var event = events[i];
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

			outputArmingsAndDisarmingsBetween(lastEventTimestamp, timestamp);
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