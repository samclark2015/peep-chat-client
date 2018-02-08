import $ from 'jquery';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';
import { doSetup as notificationSetup, unregister } from 'notificationSetup';
import 'stylesheets/Toggle.css';
import 'stylesheets/Settings.css';

const settings = require('api-config');

export class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			notifications: localStorage.getItem('notifications') == 'true',
			mirror: false,
			password: false
		};

		this.toggleNotifications = this.toggleNotifications.bind(this);
		this.toggleMirror = this.toggleMirror.bind(this);
		this.togglePassword = this.togglePassword.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
	}

	componentWillMount() {
		var notificationStatus = localStorage.getItem('notifications') == 'true';
		this.setState({notifications: notificationStatus});
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

	togglePassword() {
		this.setState({password: !this.state.password});
	}

	handlePasswordChange() {
		if(this.password.value !== '' && this.password.value === this.confirmation.value) {
			$.ajax(settings.serverUrl + '/secure/users/me', {
				method: 'PUT',
				data: {
					current: this.current.value,
					password: this.password.value,
					confirmation: this.confirmation.value
				}
			})
				.then(() => {
					this.togglePassword();
				})
				.catch((err) => {
					console.error(err);
					alert('There was an error while changing your password.');
				});
		} else {
			alert('Password does not match confirmation!');
		}
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
							<span className="labelText">Change Password</span>
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
							<Button onClick={this.togglePassword} size="sm">Change</Button>
						</div>
					</div>
					<div>
						<Link to="/logout">
							<button className="btn btn-danger btn-block">Logout</button>
						</Link>
					</div>
				</div>
				<Modal
					isOpen={this.state.password}
					toggle={this.togglePassword} >
					<ModalHeader toggle={this.togglePassword}>Change Password</ModalHeader>
					<ModalBody>
						<FormGroup>
							<Label for="currentPassword">Current Password</Label>
							<input
								className="form-control"
								autoComplete="false"
								type="password"
								name="currentPassword"
								id="currentPassword"
								placeholder="Password"
								ref={(o) => this.current = o} />
						</FormGroup>
						<FormGroup>
							<Label for="newPassword">New Password</Label>
							<input
								className="form-control"
								autoComplete="false"
								type="password"
								name="newPassword"
								id="newPassword"
								placeholder="New Password"
								ref={(o) => this.password = o} />
						</FormGroup>
						<FormGroup>
							<Label for="newConfirmation">New Password Confirmation</Label>
							<input
								className="form-control"
								autoComplete="false"
								type="password"
								name="newConfirmation"
								id="newConfirmation"
								placeholder="New Password"
								ref={(o) => this.confirmation = o}/>
						</FormGroup>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={this.togglePassword}>Cancel</Button>{' '}
						<Button color="primary" onClick={this.handlePasswordChange}>Change</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}
