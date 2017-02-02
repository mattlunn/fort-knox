import jQuery from 'jquery';
import { browserHistory } from 'react-router'


class Api {
	get(url) {
		return jQuery.get(url).then(null, (xhr) => {
			if (xhr.status === 401) {
				browserHistory.push('/login');
			}

			return jQuery.Deferred().reject();
		});
	}

	post(url, body) {
		return jQuery.post(url, body).then(null, (xhr) => {
			if (xhr.status === 401) {
				browserHistory.push('/login');
			}

			return jQuery.Deferred().reject();
		});
	}
}

export default new Api();
