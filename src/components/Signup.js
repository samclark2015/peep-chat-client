import $ from 'jquery';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Label } from 'reactstrap';
import 'stylesheets/Login.css';
const settings = require('api-config.js');

export class Signup extends Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		let url = settings.serverUrl + '/signup';
		let creds = {
			name: this.name.value,
			username: this.username.value,
			password: this.password.value,
			confirmation: this.confirmation.value
		};
		if(creds.password === creds.confirmation) {
			$.post(url, creds)
			 	.then((data) => {
					this.props.onLogin(data.token);
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			alert('Password does not match confirmation!');
		}
	}

	render() {
		return (
			<div className="loginContainer">
				<div className="loginContent">
					<h1>Peep</h1>
					<Form onSubmit={this.handleSubmit} autoComplete="off">
						<FormGroup>
							<Label for="name">Name</Label>
							<input className="form-control" type="text" name="name" id="name" ref={(o) => this.name = o} placeholder="Name" />
						</FormGroup>
						<FormGroup>
							<Label for="username">Username</Label>
							<input className="form-control" type="text" name="username" id="username" ref={(o) => this.username = o} placeholder="Username" />
						</FormGroup>
						<FormGroup>
							<Label for="password">Password</Label>
							<input className="form-control" type="password" name="password" id="password" placeholder="Password" ref={(o) => this.password = o}  />
						</FormGroup>
						<FormGroup>
							<Label for="confirmation">Password Confirmation</Label>
							<input className="form-control" type="password" name="confirmation" id="confirmation" placeholder="Password" ref={(o) => this.confirmation = o}  />
						</FormGroup>
						<Button>Sign Up</Button>
					</Form>
				</div>
				{this.props.user ? <Redirect to="/dashboard" /> : null}
			</div>
		);
	}
}
