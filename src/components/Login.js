import $ from 'jquery';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Label } from 'reactstrap';
import 'stylesheets/Login.css';
const settings = require('api-config.js');

export class Login extends Component {
	login(event) {
		let loginUrl = settings.serverUrl + '/login';
		let creds = {
			username: this.username.value,
			password: this.password.value
		};
		$.post(loginUrl, creds, (data) => {
			this.props.onLogin(data.token);
		});
		event.preventDefault();
	}

	componentWillMount() {
	}

	render() {
		return (
			<div className="loginContainer">
				<div className="loginContent">
					<h1>Peep</h1>
					<Form onSubmit={this.login.bind(this)}>
						<FormGroup>
							<Label for="exampleEmail">Username</Label>
							<input className="form-control" type="text" name="username" ref={(o) => this.username = o} placeholder="Username" />
						</FormGroup>
						<FormGroup>
							<Label for="examplePassword">Password</Label>
							<input className="form-control" type="password" name="password" id="examplePassword" placeholder="Password" ref={(o) => this.password = o}  />
						</FormGroup>
						<Button>Sign In</Button>
					</Form>
				</div>
				{this.props.user ? <Redirect to="/" /> : null}
			</div>
		);
	}
}
