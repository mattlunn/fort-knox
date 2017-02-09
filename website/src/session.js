import jQuery from 'jquery';
import { browserHistory } from 'react-router'

class Session {
	constructor() {
		this.callback = jQuery.Callbacks();
		this.isLoggedIn = null;
	}

	login(username, password) {
		return jQuery.post('/authenticate', {
			username: username,
			password: password
		}).then(() => {
			this.callback.fire(true);
		});
	}

	getHistory() {
		return this.proxyLoginStatus(jQuery.get('/history'));
	}

	getArmedState() {
		return this.proxyLoginStatus(jQuery.get('/armed'));
	}

	setArmedState(armed) {
		return this.proxyLoginStatus(jQuery.post('/armed', {
			armed: armed
		}));
	}

	proxyLoginStatus(deferred) {
		return deferred.then((data) => {
			if (this.isLoggedIn !== true) {
				this.isLoggedIn = true;
				this.callback.fire(true);
			}

			return data;
		}, (xhr) => {
			if (xhr.status === 401) {
				browserHistory.push('/login');
				if (this.isLoggedIn !== false) {
					this.isLoggedIn = false;
					this.callback.fire(false);
				}
			}

			return jQuery.Deferred().reject(xhr);
		});
	}

	onLoginStateChanged(handler) {
		this.callback.add(handler);
	}
}

export default new Session();