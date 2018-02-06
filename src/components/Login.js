import $ from 'jquery';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Button, Form, FormGroup, Label } from 'reactstrap';
import 'stylesheets/Login.css';
const settings = require('api-config.js');

export class Login extends Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		let loginUrl = settings.serverUrl + '/login';
		let creds = {
			username: this.username.value,
			password: this.password.value
		};
		$.post(loginUrl, creds, (data) => {
			this.props.onLogin(data.token);
		});
	}

	render() {
		return (
			<div className="loginContainer">
				<div className="loginContent">
					<h1>Peep</h1>
					<Form onSubmit={this.handleSubmit}>
						<FormGroup>
							<Label for="username">Username</Label>
							<input className="form-control" type="text" name="username" id="username" ref={(o) => this.username = o} placeholder="Username" />
						</FormGroup>
						<FormGroup>
							<Label for="password">Password</Label>
							<input className="form-control" type="password" name="password" id="password" placeholder="Password" ref={(o) => this.password = o}  />
						</FormGroup>
						<div>
							<Button>Login</Button>
							<Link className="pull-right" to="/signup">Sign Up</Link>
						</div>
					</Form>
				</div>
				{this.props.user ? <Redirect to="/dashboard" /> : null}
			</div>
		);
	}
}
