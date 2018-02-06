import $ from 'jquery';
import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect  } from 'react-router-dom';
import { UserLanding } from 'components/UserLanding';
import { UserLookup } from 'classes/UserLookup';
import { Login } from 'components/Login';
import { ThreadStore } from 'classes/ThreadStore';
import '../stylesheets/App.css';

const settings = require('api-config');

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
			isReady: false
		};

		this.landingComponent = this.landingComponent.bind(this);
		this.logoutComponent = this.logoutComponent.bind(this);
		this.loginComponent = this.loginComponent.bind(this);
		this.loginSuccess = this.loginSuccess.bind(this);
	}

	componentWillMount() {
		let token = localStorage.getItem('token');
		if(token) {
			this.setGlobalToken(token);
			this.setupLookup(token);
		} else {
			this.setState({isReady: true});
		}
	}

	componentDidMount() {
	}

	setupLookup(token) {
		this.lookup = new UserLookup(settings.serverUrl+'/secure/users', token);
		this.lookup.get('me').then(
			(data) => {
				data.token = token;
				ThreadStore.getInstance(settings.serverUrl+'/secure/threads', token);
				this.setState({user: data, isReady: true});
			},
			() => {
				this.setState({isReady: true});
			});
	}

	loginSuccess(token) {
		localStorage.setItem('token', token);
		this.setGlobalToken(token);
		this.setupLookup(token);
	}

	setGlobalToken(token) {
		var headers = {};
		if(token)
			headers['Authorization'] = 'Bearer '+token;
		$.ajaxSetup({
			headers: headers
		});
	}

	logoutComponent() {
		localStorage.clear();
		this.setGlobalToken(null);
		this.setState({user: null});
		ThreadStore.reset();
		return <Redirect to='/login' />;
	}

	loginComponent({history}) {
		return <Login history={history} onLogin={this.loginSuccess} user={this.state.user}/>;
	}

	landingComponent({history}) {
		return <UserLanding user={this.state.user} history={history}/>;
	}

	render() {
		if(this.state.isReady) {
			return (
				<Router>
					<Fragment>
						<Switch>
							<Route exact path="/login" component={this.loginComponent} />
							<Route exact path="/logout" component={this.logoutComponent} />
							{ !this.state.user ? <Redirect to="/logout" /> : null }
							<Route path="/dashboard" component={this.landingComponent} />
							{ this.state.user ? <Redirect from="/" to="/dashboard" /> : null}
						</Switch>
					</Fragment>
				</Router>
			);
		} else {
			return null;
		}
	}
}

export default App;
