import React, { Component } from 'react';
import Day from './Day';
import api from '../api';
import './Home.css';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = { days: [] };
		this.init();
	}

	render() {
		return (<div className="container-fluid" id="history-container">
			{this.state.days.map((x, i) => (<Day key={i} day={x} />))}
		</div>);
	}

	init() {
		api.get('/history').then((data) => {
			this.setState({
				days: data
			});
		});
	}
}

export default Home;
