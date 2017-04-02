var Sequelize = require('sequelize');
var moment = require('moment');

module.exports.create = function (sequelize) {
	var arming = sequelize.define('arming', {
		start: {
			type: Sequelize.DATE
		},
		end: {
			type: Sequelize.DATE
		}
	});

	arming.checkIfIsArmedAt = function (time) {
		return this.findOne({
			order: [['start', 'DESC']],
			where: {
				start: {
					$lt: moment(time).toDate()
				}
			}
		}).then((arming) => {
			return arming && (!arming.end || moment(arming.end).isAfter(time));
		});
	};

	return arming;
};