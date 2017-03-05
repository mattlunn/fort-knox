import React, { Component } from 'react';
import Day from './Day';
import session from '../session';
import moment from 'moment';

class History extends Component {
	constructor(props) {
		super(props);
		this.state = { days: [] };
		this.init();
	}

	render() {
		return (<div className="history-container">
			{this.state.days.map((day) => <Day key={day.day} day={day.day} events={day.events} />)}
		</div>);
	}

	init() {
		session.getHistory().then((events) => {
			var days = [];
			var currentDay = null;

			for (var i=0;i<events.length;i++) {
				var thisDay = moment(events[i].timestamp).format('YYYY-MM-DD');

				if (currentDay !== thisDay) {
					days.push({
						day: thisDay,
						events: []
					});
				}

				days[days.length - 1].events.push(events[i]);
				currentDay = thisDay;
			}

			this.setState({
				days: days
			});
		});
	}
}

export default History;
