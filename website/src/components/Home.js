import React, { Component } from 'react';
import { Link } from 'react-router';
import './Home.css';

class Home extends Component {
	render() {
		return (<div className="container" id="page-container">
			<ul className="nav nav-tabs">
				<li className="nav-item">
					<Link to="/timeline" className="nav-link" activeClassName="active">Timeline</Link>
				</li>
				<li className="nav-item">
					<Link to="/list" className="nav-link" activeClassName="active">List</Link>
				</li>
			</ul>

			{this.props.children}
		</div>);
	}
}

export default Home;
