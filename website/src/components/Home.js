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
		return (<div className="container-fluid" id="page-container">
			<ul className="nav nav-tabs">
				<li className="nav-item">
					<a className="nav-link active" href="/#/timeline">Timeline</a>
				</li>
				<li className="nav-item">
					<a className="nav-link" href="/#/list">List</a>
				</li>
			</ul>
			<div id="history-container">
				{this.state.days.map((x, i) => (<Day key={i} day={x} />))}
			</div>
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
