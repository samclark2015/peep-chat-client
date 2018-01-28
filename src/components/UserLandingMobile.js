import '../stylesheets/UserLandingMobile.css';
import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
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

			let primary = (
				<div className="userLandingThreadCol mobile">
					<Threads lookup={this.lookup} token={this.props.token} selectThread={this.handleSelectThread.bind(this)}/>
				</div>
			);

			let secondary = (
				<div className="userLandingConvoCol mobile">
					<Conversation key={this.state.selectedThread} ref={(o) => {this.convo = o;} } data={convoData} thread={this.state.selectedThread} />
				</div>
			);

			return(
				<div className="userLandingContainer mobile">
					<div className="userLandingHeaderRow mobile text-center" style={{display: 'flex'}}>
						<span style={{marginBottom: 0}} className="float-left align-middle h4" onClick={() => {this.setState({showSecondary: false});}}><FontAwesome name='chevron-left' />Back</span>
						<span style={{flexGrow: 2}}><h2>Peep</h2></span>
						<span style={{marginBottom: 0}} className="float-right h4" onClick={() => {this.props.onLogout();}}>Logout <FontAwesome name='sign-out' /></span>
					</div>
					<div className="userLandingContentRow mobile">
						<TwoPage primaryPane={primary} secondaryPane={secondary} showSecondary={this.state.showSecondary} />
					</div>
				</div>
			);
		} else {
			return <div></div>;
		}
	}
}
