import React, { Component } from 'react';
import moment from 'moment';
import './Day.css';

class Day extends Component {
	constructor(props) {
		super(props);
		this.state = { showVideo: false };
		this.toggleVideo = this.toggleVideo.bind(this);
	}

	render() {
		return (<div className="day">
			<h5 className="day-date">{moment(this.props.day).format('dddd Do MMMM')}</h5>
			<div className="card">
				<ul className="list-group list-group-flush">
					{this.props.events.map((event, i) => (
						<li key={i} className="list-group-item flex-row justify-content-start day-activity">
							<div className="p-2 timestamp"><span className={"badge " + this.generateClassNameForEvent(event)}>{moment(event.timestamp).format('HH:mm:ss')}</span></div>
							<div className="p-2">{this.generateSummaryForEvent(event)}</div>
							<div className="ml-auto p-2">{this.generateLinksForEvent(event)}</div>

							{this.renderVideoElement(event)}
						</li>
					))}
				</ul>
			</div>
		</div>);
	}

	generateClassNameForEvent(event) {
		if (event.type === 'EVENT') {
			return event.isArmed ? 'badge-danger' : 'badge-success';
		}

		return 'badge-plain';
	}

	generateSummaryForEvent(event) {
		switch (event.type) {
			case 'EVENT':
				return (<span>Motion detected by&nbsp;<strong>{event.device.name}</strong></span>);
			case 'ARMING':
				return (<span><strong>Armed</strong>&nbsp;{"by " + event.user.firstName}</span>);
			case 'DISARMING':
				return (<span><strong>Disarmed</strong>&nbsp;{"by " + event.user.firstName}</span>);
		}
	}

	generateLinksForEvent(event) {
		if (event.type === 'EVENT' && event.recording)
			return (<span><a onClick={this.toggleVideo} href="#" className="card-link">view</a> <a href={"/api/recording/" + event.recording.id + "?download=true"} className="card-link">download</a></span>);

		return null;
	}

	renderVideoElement(event) {
		if (event.recording) {
			return (<video width="100%" ref={(player) => this.player = player} preload="none" className={this.state.showVideo ? '' : 'd-none'} controls src={"/api/recording/" + event.recording.id }></video>)
		}

		return null;
	}

	toggleVideo(e) {
		var showVideo = !this.state.showVideo;

		e.preventDefault();

		this.setState({
			showVideo: showVideo
		});

		this.player.play();
	}
}

export default Day;