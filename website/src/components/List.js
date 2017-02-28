import React, { Component } from 'react';
import Day from './Day';
import session from '../session';
import './Home.css';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = { days: [] };
		this.init();
	}

	render() {
		return (<div className="history-container">
			<Day />
			<Day />
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
