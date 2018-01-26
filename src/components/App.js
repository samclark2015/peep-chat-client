import React, { Component } from 'react';
import '../stylesheets/App.css';
import { UserLanding } from './UserLanding.js';
import { Login } from './Login.js';
import $ from 'jquery';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: null
		};
	}

	loginSuccess(token) {
		/*$.ajax({
      url: "http://localhost:8080/secure/users/me",
      headers: {"Authorization": "Bearer "+token},
      success: (data) => {
        var user = data;
        user.token = token;
        this.setState({
          user: user
        });
      }
    });*/
		this.setState({token: token});
	}

	render() {
		if(this.state.token) {
			return <UserLanding token={this.state.token}/>;
		} else {
			return <Login onLogin={this.loginSuccess.bind(this)} />;
		}

	}
}

export default App;
