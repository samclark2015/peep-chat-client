import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect  } from 'react-router-dom';
import { UserLandingMobile } from './UserLandingMobile.js';
import { Login } from './Login.js';
import '../stylesheets/App.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: null
		};

		this.landingComponent = this.landingComponent.bind(this);
		this.logoutComponent = this.logoutComponent.bind(this);
		this.loginComponent = this.loginComponent.bind(this);
		this.loginSuccess = this.loginSuccess.bind(this);
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

	logoutComponent() {
		localStorage.removeItem('token');
		this.setState({token: null});
		return <Redirect to='/login' />;
	}

	loginComponent({history}) {
		return <Login token={this.state.token} history={history} onLogin={this.loginSuccess}/>;
	}

	landingComponent({history}) {
		return <UserLandingMobile token={this.state.token} history={history}/>;
	}

	render() {
		return (
			<Router>
				<Switch>
					<Route exact path="/login" component={this.loginComponent} />
					<Route exact path="/logout" component={this.logoutComponent} />
					<Route path="/" component={this.landingComponent} />
				</Switch>
			</Router>
		);
	}
}

export default App;
