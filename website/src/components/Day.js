import React, { Component } from 'react';
import jQuery from 'jquery';
import moment from 'moment';

class Day extends Component {
	constructor(props) {
		super(props);
		this.key = 0;
	}

	render() {
		return (
			<div className="row">
				<div className="col-md-2">
					{moment(this.props.day.date).format('dddd Do')}
				</div>
				<div className="col-md-10">
					<div className="progress">
					  {this.dayEvents()}
					</div>
				</div>
			</div>
		);
	}

	dayEvents() {
		var ret = [];
		var armings = this.props.day.armings;
		var now = moment(this.props.day.date).startOf('day');

		for (var i=0;i<armings.length;i++) {
			var startOfArming = moment(armings[i].from);
			var endOfArming = moment(armings[i].to);

			ret = ret.concat(this.getEventsBetween(now, startOfArming, false));
			ret = ret.concat(this.getEventsBetween(startOfArming, endOfArming, true));

			now = endOfArming;
		}

		ret = ret.concat(this.getEventsBetween(now, moment(this.props.day.date).endOf('day'), false));


		return ret;
	}

	getEventsBetween(from, to, isArmed) {
		var events = this.props.day.events.filter(x => moment(x.from).isBetween(from, to, '[)') || moment(x.to).isBetween(from, to, '[)'));
		var ret = [];

		for (var i=0;i<events.length;i++) {
			var startOfEvent = moment(events[i].from);
			var endOfEvent = moment(events[i].to);

			var modifiedStartOfEvent = startOfEvent.isBefore(from) ? from : startOfEvent;
			var modifiedEndOfEvent = endOfEvent.isAfter(to) ? to : endOfEvent;

			ret.push((<div className={'progress-bar ' + (isArmed ? 'bg-armed' : 'bg-unarmed')} key={++this.key} style={ { width: this.timespanToPercentage(from, modifiedStartOfEvent) } }></div>));
			ret.push((<div className={'progress-bar ' + (isArmed ? 'bg-danger' : 'bg-success')} key={++this.key} style={ { width: this.timespanToPercentage(modifiedStartOfEvent, modifiedEndOfEvent) } }></div>));

			from = modifiedEndOfEvent;
		}

		ret.push((<div className={'progress-bar ' + (isArmed ? 'bg-armed' : 'bg-unarmed')} key={++this.key} style={ { width: this.timespanToPercentage(from, to) } }></div>));
		return ret;
	}

	timespanToPercentage(from, to) {
		return (moment.duration(Math.abs(from.diff(to))).asMinutes() / 14.4) + '%';
	}
}

export default Day;
