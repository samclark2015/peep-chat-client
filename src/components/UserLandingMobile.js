/*global device:true*/

import '../stylesheets/UserLandingMobile.css';
import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { TwoPage } from './TwoPage';
import { Conversation } from './Conversation.js';
import { Threads } from './Threads.js';
import { Container, Row, Col } from 'reactstrap';
import { UserLookup } from '../classes/UserLookup.js';
import { SWSetup } from '../notificationSetup';
var FontAwesome = require('react-fontawesome');
const ReconnectingWebSocket = require('reconnecting-websocket');


const settings = require('../api-config.js');

export class UserLandingMobile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
			selectedThread: null,
			ws: null,
			showSecondary: false
		};
		this.swSetup = new SWSetup();
		this.lookup = new UserLookup(settings.serverUrl + '/secure/users', this.props.token);
	}

	componentWillMount() {
		this.lookup.get('me').then(
			(data) => {
				data.token = this.props.token;
				this.setState({user: data});
			},
			(err, text) => {
				this.props.onLogout();
				console.warn(text);
			});
	}

	handleSubscribe() {
		if (window.cordova) {
			console.log('Platform: cordova; Using FCM.');
			document.addEventListener('deviceready', () => {
				window.FirebasePlugin.getToken(function(token) {
					// save this server-side and use it to push notifications to this device
					console.log(token);
				}, function(error) {
					console.error(error);
				});
				window.FirebasePlugin.onTokenRefresh(function(token) {
					// save this server-side and use it to push notifications to this device
					console.log(token);
				}, function(error) {
					console.error(error);
				});

				window.FirebasePlugin.onNotificationOpen(function(notification) {
					console.log(notification);
				}, function(error) {
					console.error(error);
				});
			}, false);

		} else {
			console.log('Platform: web; Using WebPush.');
			this.swSetup.registerServiceWorker().then(() => {
				this.swSetup.askPermission().then((data) => {
					this.swSetup.subscribeUserToPush().then((subscription) => {
						return fetch(
							settings.serverUrl + '/secure/subscribe',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'Authorization': 'Bearer ' + this.props.token
								},
								body: JSON.stringify(subscription)
							}).then(function(response) {
							if (!response.ok) {
								throw new Error('Bad status code from server.');
							}
							return response.json();
						}).then(function(responseData) {
							if (!(responseData.data && responseData.data.success)) {
								throw new Error('Bad response from server.');
							}
						});
					});
				});
			});
		}
	}

	componentDidMount() {
		let ws = new ReconnectingWebSocket(settings.wsUrl);
		ws.listeners = [];
		ws.onopen = this.handleOpen.bind(this);
		ws.onmessage = this.handleMessage.bind(this);

		this.handleSubscribe();

		ws.listeners.push((message) => {
			if(message.type === 'typing') {
				return;
			} else if(message.type === 'message') {
				return;
			}
		});

		this.setState({ ws: ws });

	}

	handleMessage(message) {
		let data = JSON.parse(message.data);
		this.state.ws.listeners.forEach((listener) => {
			listener(data);
		});
	}


	handleOpen(event) {
		let data = {
			'type': 'signon',
			'payload': this.props.token
		};
		this.state.ws.send(JSON.stringify(data));
		event.preventDefault();
	}

	handleSelectThread(id) {

		this.setState({ showSecondary: true, selectedThread: id});
		console.log(this.state);
	}

	render() {
		if(this.state.user && this.state.ws) {
			let convoData = {
				ws: this.state.ws,
				user: this.state.user,
				lookup: this.lookup
			};

			let primary = () => (
				<div className="userLandingThreadCol mobile">
					<Threads lookup={this.lookup} token={this.props.token} />
				</div>
			);

			let secondary = ({ match }) => {
				return (
					<div className="userLandingConvoCol mobile">
						<Conversation key={match.params.id} data={convoData} thread={match.params.id} />
					</div>
				);
			};


			let mobileView = () => {
				console.log('mobile');
				return (
					<Switch>
						<Route exact path="/" component={primary}/>
						<Route path="/threads/:id" component={secondary}/>
					</Switch>
				);
			};

			let desktopView = () => {
				return (
					<div id="splitviewContainer">
						<div id="primaryPane">
							<Route path="/" component={primary}/>
						</div>
						<div id="secondaryPane">
							<Route path="/threads/:id" component={secondary}/>
						</div>
					</div>
				);
			};

			let backButton = () => <Link to="/"><span style={{marginBottom: 0}} className="float-left align-middle h4"><FontAwesome name='chevron-left' /></span></Link>;

			return(
				<div className="userLandingContainer mobile">
					<div className="userLandingHeaderRow mobile text-center" style={{display: 'flex'}}>
						<MediaQuery query="(max-width: 1024px)">
							<Route path="/threads/:id" component={backButton}/>
						</MediaQuery>

						<span style={{flexGrow: 2}}><h2>Peep</h2></span>
						<span style={{marginBottom: 0}} className="float-right h4" onClick={() => {this.props.onLogout();}}><FontAwesome name='sign-out' /></span>
					</div>
					<div className="userLandingContentRow mobile">
						<MediaQuery query="(max-width: 1024px)">
							<div id="splitviewContainer">
								{mobileView()}
							</div>
						</MediaQuery>
						<MediaQuery query="(min-width: 1024px)">
							{desktopView()}
						</MediaQuery>
					</div>
				</div>
			);
		} else {
			return <div></div>;
		}
	}
}
