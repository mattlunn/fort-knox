import React, { Component } from 'react';
import Day from './Day';
import session from '../session';
import moment from 'moment';
import $ from 'jquery';
import './History.css';

class History extends Component {
	constructor(props) {
		super(props);
		this.init();
	}

	render() {
		return (<div className="history-container">
			{this.state.days.map((day) => <Day key={day.day} day={day.day} events={day.events} />)}
		</div>);
	}

	componentDidMount() {
		$(document).on('scroll', this.onScroll);
	}

	componentWillUnmount() {
		$(document).off('scroll', this.onScroll);
	}

	onScroll(e) {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100 && this.loader === null) {
			var day = this.state.days[this.state.days.length - 1];

			this.loadHistory(moment(day.events[day.events.length - 1].timestamp));
		}
	}

	init() {
		this.state = { days: [] };
		this.loader = null;
		this.onScroll = this.onScroll.bind(this);

		this.loadHistory(moment());
	}

	loadHistory(timestamp) {
		if (this.loader === null) {
			this.loader = session.getHistory(timestamp.format('X')).then((events) => {
				var days = this.state.days;

				var currentDay = days.length
					? days[days.length - 1].day
					: null;

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

				console.log(days);

				this.setState({
					days: days
				});
			}).always(() => {
				this.loader = null;
			});
		}
	}
}

export default History;
