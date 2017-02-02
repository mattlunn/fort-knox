import React, { Component } from 'react';
import api from '../api';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = { armed: true };
		this.toggleArming = this.toggleArming.bind(this);
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-toggleable-md navbar-inverse bg-inverse">
					<a className="navbar-brand" href="#">Fort Knox</a>

						<ul className="navbar-nav mr-auto"></ul>

						<form className="form-inline my-2 my-lg-0" id="arming-form">
							<button className={ 'btn btn-sm ' + (this.state.armed ? 'btn-success' : 'btn-danger')} onClick={this.toggleArming} type="button" >{ this.state.armed ? 'Unarmed' : 'Armed'}</button>
							&nbsp;
							<input type="checkbox" className="toggler" id="toggle" checked={!this.state.armed} onClick={this.toggleArming} />
							<label htmlFor="toggle"></label>
						</form>
				</nav>

				{this.props.children}
			</div>
		);
	}

	toggleArming() {
		this.setState({
			armed: !this.state.armed
		});

		api.post('/arm', {
			arm: this.state.armed
		});
	}
}

export default App;
