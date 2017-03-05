import React, { Component } from 'react';
import moment from 'moment';
import Event from './Event';
import './Day.css';

class Day extends Component {
	render() {
		return (<div className="day">
			<h5 className="day-date">{moment(this.props.day).format('dddd Do MMMM')}</h5>
			<div className="card">
				<ul className="list-group list-group-flush">
					{this.props.events.map((event, i) => <Event event={event} key={i} />)}
				</ul>
			</div>
		</div>);
	}
}

export default Day;