import $ from 'jquery';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { UserLanding } from './UserLanding.js';
import { UserLandingMobile } from './UserLandingMobile.js';
import { Login } from './Login.js';
import MediaQuery from 'react-responsive';
import '../stylesheets/App.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: null
		};
	}

	componentWillMount() {
		let token = localStorage.getItem('token');
		if(token) {
			this.setState({token: token});
		}
	}

	componentDidMount() {
	}

	loginSuccess(token) {
		localStorage.setItem('token', token);
		this.setState({token: token});
	}

	logout() {
		localStorage.removeItem('token');
		this.setState({token: null});
	}

	render() {
		if(this.state.token) {
			let landing = () => <UserLandingMobile token={this.state.token} onLogout={this.logout.bind(this)}/>;
			return (
				<Router>
					<div>
						<Route path="/" component={landing} />
					</div>
				</Router>
			);
		} else {
			return <Login onLogin={this.loginSuccess.bind(this)} />;
		}

	}
}

export default App;
