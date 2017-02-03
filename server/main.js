var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var moment = require('moment');
var path = require('path');
var config = require('./config');
var app = express();
var port = 3001;

require('./db').then(function (db) {
	app.use(express.static('../client/build'));
	app.use(session({
		secret: config.cookie_secret,
		saveUninitialized: false,
		resave: false
	}));

	app.use(bodyParser.urlencoded({ extended: false }));

	app.get('/', function (req, res) {
		res.sendFile(path.join(__dirname, '../client/build/', 'index.html'));
	});

	function authenticate(req, res, next) {
		if (!req.session.userId) {
			res.status(401).end();
		} else {
			next();
		}
	}

	app.post('/authenticate', function (req, res) {
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

	app.get('/motion', function (req, res) {
		var name = req.params.camera || 'default';

		db.Camera.findOne({
			machineName: name
		}).then(function (camera) {
			return camera || db.Camera.build({
				machineName: name,
				friendlyName: name
			}).save();
		}).then(function (camera) {
			return db.Event.build({
				timestamp: new Date(),
				cameraId: camera.id
			}).save();
		}).then(function () {
			res.end();
		}, function (err) {
			console.log(err);
			res.status(500).end(err);
		});
	});

	app.post('/armed', authenticate, function (req, res) {
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

	app.get('/armed', authenticate, function (req, res) {
		var now = moment();

		db.Arming.findOne({
			order: [['start', 'DESC']]
		}).then(function (arming) {
			res.json(arming && (!arming.end || moment(arming.end).isAfter(now))).end();
		}, function (err) {
			res.status(500).end(err);
		});
	});

	app.get('/history', authenticate, function (req, res) {
		function groupEvents(events) {
			var ret = [];

			for (var i=0;i<events.length;i++) {
				var now = moment(events[i].timestamp).startOf('minute');
				var end = now;

				for (var j=i+1;j<events.length;j++) {
					var then = moment(events[j].timestamp).startOf('minute');

					if (end.add(1, 'minute').isSameOrAfter(then)) {
						end = then;
					} else {
						break;
					}
				}

				ret.push({
					from: now.toISOString(),
					to: end.endOf('minute').toISOString()
				});

				i = j;
			}

			return ret;
		}

		function getArmingsForDay(armings, startOfDate) {
			var ret = [];
			var endOfDate = moment(startOfDate).endOf('day');

			for (var i=0;i<armings.length;i++) {
				var startOfArming = moment(armings[i].start);
				var endOfArming = moment(armings[i].end);

				if (startOfArming.isAfter(endOfDate)) {
					break;
				}

				if (endOfArming.isBefore(startOfDate)) {
					continue;
				}

				// Otherwise, this arming passes somepart through the day...
				ret.push({
					from: (startOfArming.isBefore(startOfDate) ? startOfDate : startOfArming).toISOString(),
					to: (endOfArming.isBefore(endOfDate) ? endOfArming : endOfDate).toISOString()
				});
			}

			return ret;
		}

		Promise.all([
			db.Event.findAll(),
			db.Arming.findAll()
		]).then(function (results) {
			var [events, armings] = results;
			var ret = [];

			for (var i=0;i<14;i++) {
				var date = moment().startOf('day').subtract(i, 'days');

				ret.push({
					date: date.format('YYYY-MM-DD'),
					events: groupEvents(events.filter(function (event) {
						return moment(event.timestamp).startOf('day').isSame(date);
					})),
					armings: getArmingsForDay(armings, date)
				});
			}

			res.json(ret).end();
		}, function (err) {
			console.log(err);
			res.status(500).end(err);
		});
	});

	app.listen(port, function () {
		console.log('Example app listening on port ' + port + '!');
	});
}, function (err) {
	console.log(err);
});