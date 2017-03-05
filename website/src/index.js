import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Home from './components/Home';
import History from './components/History';
import Login from './components/Login';
import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';

ReactDOM.render(
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<Route component={Home}>
				<IndexRedirect to="/history" />
				<Route path="history" component={History} />
			</Route>
			<Route path="login" component={Login} />
		</Route>
	</Router>,
	document.getElementById('root')
);
