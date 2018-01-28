import '../stylesheets/UserLanding.css';
import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { Conversation } from './Conversation.js';
import { Threads } from './Threads.js';
import { Container, Row, Col } from 'reactstrap';
import { UserLookup } from '../classes/UserLookup.js';
import { SWSetup } from '../notificationSetup';
const ReconnectingWebSocket = require('reconnecting-websocket');


const settings = require('../api-config.js');

export class UserLanding extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
			selectedThread: null,
			ws: null
		};
		this.swSetup = new SWSetup();
		this.lookup = new UserLookup(settings.serverUrl + '/secure/users', this.props.token);
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
				if(message.payload.sender._id != this.state.user._id) {
					return;
				}
			}
		});

		this.setState({ ws: ws });
	}

	handleSubscribe() {
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
		this.setState({selectedThread: id});
	}

	render() {
		if(this.state.user && this.state.ws) {
			let convoData = {
				ws: this.state.ws,
				user: this.state.user,
				lookup: this.lookup
			};

			return(
				<div className="userLandingContainer">
					<div className="userLandingHeaderRow">
						<div className="userLandingHeaderLeft">
							<h1>Welcome, {this.state.user.name}</h1>
						</div>
						<span className="pull-right"><h3 onClick={() => {this.props.onLogout();}}><a href="#">Log Out</a></h3></span>
					</div>
					<div className="userLandingContentRow">
						<div className="userLandingThreadCol">
							<Threads lookup={this.lookup} token={this.props.token} selectThread={this.handleSelectThread.bind(this)}/>
						</div>
						<div className="userLandingConvoCol">
							{
								this.state.selectedThread ? <Conversation key={this.state.selectedThread} ref={(o) => {this.convo = o;} } data={convoData} thread={this.state.selectedThread} />
									: null }

						</div>
					</div>
				</div>
			);
		} else {
			return <div></div>;
		}
	}
}
