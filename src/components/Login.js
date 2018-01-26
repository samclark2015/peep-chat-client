import React, { Component } from 'react';
import $ from 'jquery';

export class Login extends Component {
	login(event) {
		$.post('http://localhost:8080/login', {
			username: this.username.value,
			password: this.password.value
		}, (data) => {
			// data will be jwt
			console.log(data);
			this.props.onLogin(data.token);
		});
		event.preventDefault();
	}

	render() {
		return (
			<div className="App">
				<h1>Please sign in.</h1>
				<form onSubmit={this.login.bind(this)}>
					<label>
         Username:
						<input type="text" ref={(o) => this.username = o} />
					</label>
					<label>
         Password:
						<input type="password" ref={(o) => this.password = o} />
					</label>
					<input type="submit" value="Sign on" />
				</form>
			</div>
		);
	}
}
