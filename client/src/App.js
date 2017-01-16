import React, { Component } from 'react';
import Day from './Day';
import jQuery from 'jquery';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = { days: [] };
		this.init();
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-toggleable-md navbar-inverse bg-inverse">
					<a className="navbar-brand" href="#">Fort Knox</a>

					<div className="collapse navbar-collapse">
						<ul className="navbar-nav mr-auto"></ul>

						<form className="form-inline my-2 my-lg-0">
							Unarmed 
							<input type="checkbox" name="toggle" onChange={this.toggleArming} id="toggle" />
							<label htmlFor="toggle"></label>
						</form>
					</div>
				</nav>

				<div className="container-fluid">
					{this.state.days.map((x, i) => (<Day key={i} day={x} />))}
				</div>
			</div>
		);
	}

	toggleArming() {
		jQuery.post('/arm');
	}

	init() {
		jQuery.get('/history').then((data) => {
			this.setState({
				days: data
			});
		});
	}
}

export default App;
