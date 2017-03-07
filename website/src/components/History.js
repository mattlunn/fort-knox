import React, { Component } from 'react';
import Day from './Day';
import session from '../session';
import moment from 'moment';
import $ from 'jquery';
import './History.css';
import '../font-awesome/css/font-awesome.css';

class History extends Component {
	constructor(props) {
		super(props);
		this.init();
	}

	render() {
		return (<div className="history-container">
			<div>{this.state.days.map((day) => <Day key={day.day} day={day.day} events={day.events} />)}</div>
			<div className={'history-loading-spinner ' + (this.state.isLoading ? '' : 'hidden')} ref="loadingSpinner"><i className="fa fa-spinner fa-spin" aria-hidden="true"></i></div>
		</div>);
	}

	componentDidMount() {
		$(document).on('scroll', this.onScroll);
	}

	componentWillUnmount() {
		$(document).off('scroll', this.onScroll);
	}

	onScroll(e) {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
			var day = this.state.days[this.state.days.length - 1];

			this.loadHistory(moment(day.events[day.events.length - 1].timestamp));
		}
	}

	init() {
		this.state = { days: [], isLoading: false };
		this.isLoading = false;

		this.onScroll = this.onScroll.bind(this);
		this.loadHistory(moment());
	}

	loadHistory(timestamp) {
		var setLoadingState = function (isLoading) {
			this.isLoading = isLoading;
			this.setState({
				isLoading: isLoading
			});
		}.bind(this);

		if (!this.isLoading) {
			setLoadingState(true);

			session.getHistory(timestamp.format('X')).then((events) => {
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

				this.setState({
					days: days
				});
			}).always(() => {
				setLoadingState(false);
			});
		}
	}
}

export default History;
