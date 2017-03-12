import React, { Component } from 'react';
import jQuery from 'jquery';
import session from '../session';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = { showLoggedInNavComponents: false };
		this.toggleArming = this.toggleArming.bind(this);
		this.getLoggedInDetails();

		session.onLoginStateChanged((isLoggedIn) => {
			if (isLoggedIn) {
				this.getLoggedInDetails();
			} else {
				this.setState({
					showLoggedInNavComponents: false
				});
			}
		});
	}

	getLoggedInDetails() {
		return jQuery.when(
			session.getArmedState()
		).then((armed) => {
			this.setState({
				showLoggedInNavComponents: true,
				armed: armed
			});
		});
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-toggleable-md navbar-inverse bg-inverse">
					<div className="container">
						<a className="navbar-brand" href="#">Fort Knox</a>

						<ul className="navbar-nav mr-auto"></ul>

						{this.state.showLoggedInNavComponents && <form className="form-inline my-2 my-lg-0" id="arming-form">
							<button className={ 'btn btn-sm ' + (this.state.armed ? 'btn-danger' : 'btn-success')} onClick={this.toggleArming} type="button" >{ this.state.armed ? 'Armed' : 'Unarmed'}</button>
							&nbsp;
							<input type="checkbox" className="toggler" id="toggle" defaultChecked={this.state.armed} onClick={this.toggleArming} />
							<label htmlFor="toggle"></label>
						</form>}
					</div>
				</nav>

				{this.props.children}
			</div>
		);
	}

	toggleArming() {
		var newState = !this.state.armed;

		this.setState({
			armed: newState
		});

		session.setArmedState(newState);
	}
}

export default App;
