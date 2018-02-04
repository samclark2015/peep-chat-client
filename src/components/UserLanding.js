import _ from 'lodash';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Route, Link, Switch, Redirect } from 'react-router-dom';
import { Conversation } from './Conversation/Main.js';
import { Threads } from './Threads.js';
import { Settings } from './Settings.js';
import { ThreadStore } from 'classes/ThreadStore';
import { doSetup as notificationSetup } from '../notificationSetup';
import FontAwesome from 'react-fontawesome';
import ReconnectingWebSocket from 'reconnecting-websocket';
import '../stylesheets/UserLanding.css';
import '../stylesheets/UserLandingMobile.css';

const settings = require('../api-config.js');

export class UserLanding extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ws: null,
			showSecondary: false
		};

		this.handleThreadsUpdate = this.handleThreadsUpdate.bind(this);
	}

	componentWillMount() {
		this.threadStore = ThreadStore.getInstance();
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
		notificationSetup(this.props.user.token, (event) => this.props.history.push('/dashboard/threads/'+event.data.data.thread));
	}

	componentDidMount() {
		if(this.props.user) {
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

			ws.listeners.push(this.threadStore.handleWSMesssage);

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
			'payload': this.props.user.token
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

		if(this.props.user && this.state.ws) {
			let convoData = {
				ws: this.state.ws,
				user: this.props.user
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
						<Route path="/dashboard/threads/:id" component={secondary}/>
					</Switch>
				);
			};

			let desktopView = () => {
				return (
					<div id="splitviewContainer">
						<div id="primaryPane">
							<Route path="/dashboard" render={primary}/>
						</div>
						<div id="secondaryPane">
							<Route path="/dashboard/threads/:id" component={secondary}/>
						</div>
					</div>
				);
			};

			let dashboard = () => {
				let firstThread = _.head(this.threadStore.data);
				let redirect;
				if(firstThread) {
					let firstThreadRoute = '/dashboard/threads/' + firstThread._id;
					redirect = <Redirect exact from="/dashboard" to={firstThreadRoute} />;
				}

				return (
					<div>
						<MediaQuery query="(max-width: 1024px)">
							<div id="splitviewContainer">
								{mobileView()}
							</div>
						</MediaQuery>
						<MediaQuery query="(min-width: 1024px)">
							<Switch>
								{ redirect }
								<Route path="/dashboard" component={desktopView}/>
							</Switch>
						</MediaQuery>
					</div>
				);
			};

			let settings = ({history}) => {
				return <Settings token={this.props.user.token} history={history} />;
			};

			userView = (
				<div className="userLandingContentRow mobile">
					<Switch>
						<Route path="/dashboard/settings" component={settings} />
						<Route path="/dashboard" render={dashboard} />
					</Switch>
				</div>
			);
		}

		let backButton = () => (
			<Link to="/dashboard/">
				<span style={{marginBottom: 0}} className="float-left align-middle h4">
					<FontAwesome name='chevron-left' />
				</span>
			</Link>
		);

		let settingsButton = () => (
			<Link to="/dashboard/settings">
				<span style={{marginBottom: 0}} className="float-right align-middle h4">
					<FontAwesome name='cog' />
				</span>
			</Link>
		);

		return(
			<div className="userLandingContainer mobile">
				<div className="userLandingHeaderRow mobile text-center" style={{display: 'flex'}}>
					<MediaQuery query="(max-width: 1024px)">
						<Route path="/dashboard/(.+)" component={backButton}/>
					</MediaQuery>

					<span style={{flexGrow: 2}}><h2>Peep</h2></span>
					<MediaQuery query="(max-width: 1024px)">
						<Route exact path="/dashboard" component={settingsButton}/>
					</MediaQuery>
					<MediaQuery query="(min-width: 1024px)">
						<Route path="/dashboard" component={settingsButton}/>
					</MediaQuery>

				</div>
				{userView}
			</div>
		);
	}
}
