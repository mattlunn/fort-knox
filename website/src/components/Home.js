import React, { Component } from 'react';
import { Link } from 'react-router';
import './Home.css';

class Home extends Component {
	render() {
		return (<div className="container" id="page-container">
			{this.props.children}
		</div>);
	}
}

export default Home;
