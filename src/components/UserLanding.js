import '../stylesheets/UserLanding.css';
import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { Conversation } from './Conversation.js';
import { Threads } from './Threads.js';
import { Container, Row, Col } from 'reactstrap';
import { UserLookup } from '../classes/UserLookup.js';
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
		/*let handler = () => {
			$('.userLandingContentRow').height($(window).height() - $('.userLandingHeaderRow').height());
		};

		$(window).resize(handler);
		$('.userLandingHeaderRow').resize(handler);*/

		let ws = new ReconnectingWebSocket(settings.wsUrl);
		ws.listeners = [];
		ws.onopen = this.handleOpen.bind(this);
		ws.onmessage = this.handleMessage.bind(this);

		ws.listeners.push((message) => {
			if(message.type === 'typing') {
				return;
			} else if(message.type === 'message') {
				if (!('Notification' in window)) {
					alert('This browser does not support system notifications');
				}

				// Let's check whether notification permissions have already been granted
				else if (Notification.permission === 'granted') {
					// If it's okay let's create a notification
					let text = 'New message from ' + message.payload.sender.name;
					var notification = new Notification(text);
				}

				// Otherwise, we need to ask the user for permission
				else if (Notification.permission !== 'denied') {
					Notification.requestPermission(function (permission) {
						// If the user accepts, let's create a notification
						if (permission === 'granted') {
							var notification = new Notification('Hi there!');
						}
					});
				}

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
						<h1>Welcome, {this.state.user.name}</h1>
						<span className="pull-right"><h3 onClick={() => {this.props.onLogout();}}>Logout</h3></span>
					</div>
					<div className="userLandingContentRow">
						<div className="userLandingThreadCol">
							<Threads lookup={this.lookup} token={this.props.token} selectThread={this.handleSelectThread.bind(this)}/>
						</div>
						<div className="userLandingConvoCol">
							<Conversation ref={(o) => {this.convo = o;} } data={convoData} thread={this.state.selectedThread} />
						</div>
					</div>
				</div>
			);
		} else {
			return <div></div>;
		}
	}
}
