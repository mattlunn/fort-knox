import React, { Component } from 'react';
import './Home.css';

class Home extends Component {
	render() {
		return (<div className="container" id="page-container">
			{this.props.children}
		</div>);
	}
}

export default Home;
