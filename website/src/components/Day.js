import React, { Component } from 'react';
import './Day.css';

class Day extends Component {
	render() {
		return (<div className="day">
			<h5>Sunday 27th February</h5>
			<div className="card">
				<ul className="list-group list-group-flush">
					<li className="list-group-item flex-row justify-content-start day-activity">
						<div className="p-2 timestamp"><span className="badge badge-success">09:01:24</span></div>
						<div className="p-2">Motion detected by&nbsp;<strong>Lounge</strong></div>
						<div className="ml-auto p-2"><a href="#" className="card-link">view</a> <a href="#" className="card-link">download</a></div>
					</li>
					<li className="list-group-item flex-row justify-content-start day-activity">
						<div className="p-2 timestamp"><span className="badge badge-success">09:01:24</span></div>
						<div className="p-2">Motion detected by&nbsp;<strong>Lounge</strong></div>
						<div className="ml-auto p-2"><a href="#" className="card-link">view</a> <a href="#" className="card-link">download</a></div>
					</li>
					<li className="list-group-item flex-row justify-content-start day-activity">
						<div className="p-2 timestamp"><span className="badge badge-plain">09:01:24</span></div>
						<div className="p-2"><strong>Disarmed</strong> by&nbsp;Sandra</div>
					</li>
					<li className="list-group-item flex-row justify-content-start day-activity">
						<div className="p-2 timestamp"><span className="badge badge-danger">09:01:24</span></div>
						<div className="p-2">Motion detected by&nbsp;<strong>Lounge</strong></div>
						<div className="ml-auto p-2"><a href="#" className="card-link">view</a> <a href="#" className="card-link">download</a></div>
					</li>
					<li className="list-group-item flex-row justify-content-start day-activity">
						<div className="p-2 timestamp"><span className="badge badge-danger">09:01:24</span></div>
						<div className="p-2">Motion detected by&nbsp;<strong>Lounge</strong></div>
						<div className="ml-auto p-2"><a href="#" className="card-link">view</a> <a href="#" className="card-link">download</a></div>
					</li>
					<li className="list-group-item flex-row justify-content-start day-activity">
						<div className="p-2 timestamp"><span className="badge badge-plain">09:01:24</span></div>
						<div className="p-2"><strong>Armed</strong> by&nbsp;Matt</div>
					</li>
				</ul>
			</div>
		</div>);
	}
}

export default Day;