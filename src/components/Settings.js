import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';
import { doSetup as notificationSetup, unregister } from 'notificationSetup';
import 'stylesheets/Toggle.css';
import 'stylesheets/Settings.css';

export class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			notifications: localStorage.getItem('notifications') == 'true' || false,
			mirror: false
		};

		this.toggleNotifications = this.toggleNotifications.bind(this);
		this.toggleMirror = this.toggleMirror.bind(this);
	}

	componentWillMount() {
	}

	toggleNotifications() {
		localStorage.setItem('notifications', !this.state.notifications);
		if(!this.state.notifications) {
			notificationSetup(this.props.token, (event) => this.props.history.push('/threads/'+event.data.data.thread));
		} else {
			unregister();
		}
		this.setState({notifications: !this.state.notifications});
	}

	toggleMirror() {
		this.setState({mirror: !this.state.mirror});
	}

	handleLogout() {
		this.setState({shouldLogout: true});
	}

	render() {
		return (
			<div className="settingsContainer">
				<div className="settingsContent">
					<h1>Settings</h1>
					<div className="settingsTable">
						<div className="settingsLeft">
							<span className="labelText">Notifications</span>
							<span className="labelText">Mirror Selfies</span>
						</div>
						<div className="settingsRight">
							<Toggle
								checked={this.state.notifications}
								onChange={this.toggleNotifications}
							/>
							<Toggle
								checked={this.state.mirror}
								onChange={this.toggleMirror}
							/>
						</div>
					</div>
					<div>
						<Link to="/logout">
							<button className="btn btn-danger">Logout</button>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}
