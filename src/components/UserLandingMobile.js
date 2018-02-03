import _ from 'lodash';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Route, Link, Switch, Redirect } from 'react-router-dom';
import { Conversation } from './Conversation/Main.js';
import { Threads } from './Threads.js';
import { Settings } from './Settings.js';
import { ThreadStore } from 'classes/ThreadStore';
import { UserLookup } from 'classes/UserLookup';
import { doSetup as notificationSetup } from '../notificationSetup';
import FontAwesome from 'react-fontawesome';
import ReconnectingWebSocket from 'reconnecting-websocket';
import '../stylesheets/UserLanding.css';
import '../stylesheets/UserLandingMobile.css';

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

		this.lookup = new UserLookup(settings.serverUrl+'/secure/users', this.props.token);
		this.handleThreadsUpdate = this.handleThreadsUpdate.bind(this);
	}

	componentWillMount() {
		this.lookup.get('me').then(
			(data) => {
				data.token = this.props.token;
				this.setState({user: data});
			},
			(err, text) => {
				this.props.history.push('/logout');
				console.warn(text);
			});

		this.threadStore = ThreadStore.getInstance(settings.serverUrl+'/secure/threads', this.props.token);
		let threads = localStorage.getItem('threads');
		if(threads) {
			this.threadStore.data = JSON.parse(threads);
		}

		this.threadStore.addEventListener(this.handleThreadsUpdate);
	}

	componentWillUnmount() {
		this.threadStore.removeEventListener(this.handleThreadsUpdate);
	}

	handleThreadsUpdate() {
		let threads = this.threadStore.data;
		localStorage.setItem('threads', JSON.stringify(threads));
	}

	handleSubscribe() {
		notificationSetup(this.props.token, (event) => this.props.history.push('/threads/'+event.data.data.thread));
	}

	componentDidMount() {
		if(this.props.token) {
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


	render() {
		let userView = (
			<div className="loadingView">
				<h1>Loading...</h1>
			</div>
		);

		if(this.state.user && this.state.ws) {
			let convoData = {
				ws: this.state.ws,
				user: this.state.user
			};

			let primary = ({ history }) => (
				<div className="userLandingThreadCol mobile">
					<Threads
						ws={this.state.ws}
						history={history}
					/>
				</div>
			);

			let secondary = ({ match }) => {
				return (
					<div className="userLandingConvoCol mobile">
						<Conversation
							key={match.params.id}
							data={convoData}
							thread={match.params.id}
						/>
					</div>
				);
			};


			let mobileView = () => {
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
							<Route path="/" render={primary}/>
						</div>
						<div id="secondaryPane">
							<Route path="/threads/:id" component={secondary}/>
						</div>
					</div>
				);
			};

			let dashboard = () => {
				let firstThreadRoute = '/threads/' + _.head(this.threadStore.data)._id;
				return (
					<div>
						<MediaQuery query="(max-width: 1024px)">
							<div id="splitviewContainer">
								{mobileView()}
							</div>
						</MediaQuery>
						<MediaQuery query="(min-width: 1024px)">
							<Switch>
								<Redirect exact from="/" to={firstThreadRoute} />
								<Route path="/threads/:id" component={desktopView}/>
							</Switch>
						</MediaQuery>
					</div>
				);
			};

			let settings = ({history}) => {
				return <Settings token={this.props.token} history={history} />;
			};

			userView = (
				<div className="userLandingContentRow mobile">
					<Switch>
						<Route path="/settings" component={settings} />
						<Route path="/" render={dashboard} />
					</Switch>
				</div>
			);
		}

		let backButton = () => (
			<Link to="/">
				<span style={{marginBottom: 0}} className="float-left align-middle h4">
					<FontAwesome name='chevron-left' />
				</span>
			</Link>
		);

		let settingsButton = () => (
			<Link to="/settings">
				<span style={{marginBottom: 0}} className="float-right align-middle h4">
					<FontAwesome name='cog' />
				</span>
			</Link>
		);

		return(
			<div className="userLandingContainer mobile">
				<div className="userLandingHeaderRow mobile text-center" style={{display: 'flex'}}>
					<MediaQuery query="(max-width: 1024px)">
						<Route path="/(.+)" component={backButton}/>
					</MediaQuery>

					<span style={{flexGrow: 2}}><h2>Peep</h2></span>
					<MediaQuery query="(max-width: 1024px)">
						<Route exact path="/" component={settingsButton}/>
					</MediaQuery>
					<MediaQuery query="(min-width: 1024px)">
						<Route path="/" component={settingsButton}/>
					</MediaQuery>

				</div>
				{userView}
			</div>
		);
	}
}
