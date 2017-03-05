import React, { Component } from 'react';
import moment from 'moment';

class Event extends Component {
	constructor(props) {
		super(props);
		this.state = { showVideo: false };
		this.toggleVideo = this.toggleVideo.bind(this);
	}

	render() {
		return (<li className="list-group-item flex-row justify-content-start day-activity">
			<div className="p-2 timestamp"><span className={"badge " + this.generateClassNameForEvent()}>{moment(this.props.event.timestamp).format('HH:mm:ss')}</span></div>
			<div className="p-2">{this.generateSummaryForEvent()}</div>
			<div className="ml-auto p-2">{this.generateLinksForEvent()}</div>

			{this.renderVideoElement()}
		</li>);
	}

	generateClassNameForEvent() {
		if (this.props.event.type === 'EVENT') {
			return this.props.event.isArmed ? 'badge-danger' : 'badge-success';
		}

		return 'badge-plain';
	}

	generateSummaryForEvent() {
		switch (this.props.event.type) {
			case 'EVENT':
				return (<span>Motion detected by&nbsp;<strong>{this.props.event.device.name}</strong></span>);
			case 'ARMING':
				return (<span><strong>Armed</strong>&nbsp;{"by " + this.props.event.user.firstName}</span>);
			case 'DISARMING':
				return (<span><strong>Disarmed</strong>&nbsp;{"by " + this.props.event.user.firstName}</span>);
		}
	}

	generateLinksForEvent() {
		if (this.props.event.type === 'EVENT' && this.props.event.recording)
			return (<span><a onClick={this.toggleVideo} href="#" className="card-link">view</a> <a href={"/api/recording/" + this.props.event.recording.id + "?download=true"} className="card-link">download</a></span>);

		return null;
	}

	renderVideoElement() {
		if (this.props.event.recording) {
			return (<video width="100%" ref={(player) => this.player = player} preload="none" className={this.state.showVideo ? '' : 'd-none'} controls src={"/api/recording/" + this.props.event.recording.id }></video>)
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

export default Event;