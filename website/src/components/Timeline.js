import React, { Component } from 'react';
import DayMap from './DayMap';
import session from '../session';
import './Home.css';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = { days: [] };
		this.init();
	}

	render() {
		return (<div id="history-container">
			{this.state.days.map((x, i) => (<DayMap key={i} day={x} />))}
		</div>);
	}

	init() {
		session.getHistory().then((data) => {
			this.setState({
				days: data
			});
		});
	}
}

export default Home;
