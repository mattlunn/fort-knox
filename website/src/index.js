import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Home from './components/Home';
import List from './components/List';
import Timeline from './components/Timeline';
import Login from './components/Login';
import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';

ReactDOM.render(
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<Route component={Home}>
				<IndexRedirect to="/timeline" />
				<Route path="timeline" component={Timeline} />
				<Route path="list" component={List} />
			</Route>
			<Route path="login" component={Login} />
		</Route>
	</Router>,
	document.getElementById('root')
);
