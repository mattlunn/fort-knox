import React, { Component } from 'react';
import './Login.css';
import session from '../session';

class Login extends Component {
	constructor(props, router) {
		super(props);

		this.state = {};
		this.handleChange = this.handleChange.bind(this);
		this.doLogin = this.doLogin.bind(this);
	}

	static contextTypes = {
		router: React.PropTypes.object.isRequired
	};

	doLogin(e) {
		e.preventDefault();

		session.login(this.state.username, this.state.password).then(() => {
			this.context.router.push('/');
		}, () => {
			this.setState({
				hasLoginError: true
			});
		});
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	render() {
		return (
			<div className="d-flex justify-content-center">
				<div className="card col-md-4" id="login-card">
					{this.state.hasLoginError && <div className="alert alert-danger" role="alert"><strong>Whoops!</strong> Either your email or password was wrong. Please try again.</div>}

					<div className="card-block">
						<form onSubmit={this.doLogin}>
							<div className="form-group row">
								<label>Email</label>
								<input className="form-control" name="username" type="text" placeholder="e.g. user@email.com" onChange={this.handleChange} />
							</div>
							<div className="form-group row">
								<label>Password</label>
								<input className="form-control" name="password" type="password" onChange={this.handleChange} />
							</div>
							<div className="form-group row">
								<input className="btn btn-primary" type="submit" value="Login" />
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default Login;
