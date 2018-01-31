import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { UserLabel } from './UserLabel.js';
import { ThreadBox } from './ThreadBox.js';
import { NewThread } from './NewThread.js';
import { NavLink } from 'react-router-dom';
import '../stylesheets/Threads.css';
const settings = require('../api-config.js');


export class Threads extends Component {
	constructor(props) {
		super(props);
		this.state = {
			threads: null,
			showModal: false
		};

		this.wsListener = this.wsListener.bind(this);
	}

	wsListener(message) {
		if(message.type === 'message'){
			this.loadThreads();
		}
	}

	componentWillMount() {
		this.loadThreads();
	}

	componentDidMount() {
		this.props.ws.listeners.push(this.wsListener);
	}

	componentWillUnmount() {
		_.remove(this.props.ws.listeners, (o) => o === this.wsListener);
	}

	loadThreads() {
		$.ajax({
			url: settings.serverUrl + '/secure/threads',
			headers: {'Authorization': 'Bearer ' + this.props.token},
			success: (data) => {
				this.setState({threads: data});
			}
		});
	}

	toggleModal() {
		let val = !this.state.showModal;
		this.setState({showModal: val});
	}

	createdThread(id) {
		this.loadThreads();
		this.props.history.push('/threads/'+id);
	}

	handleSelect(id) {
		localStorage.setItem('last-thread', id);
		if(this.props.selectThread)
			this.props.selectThread(id);
	}

	handleDelete(id) {
		$.ajax({
			url: settings.serverUrl + '/secure/threads/'+id,
			headers: {'Authorization': 'Bearer ' + this.props.token},
			method: 'DELETE',
			success: () => {
				this.loadThreads();
			}
		});
	}

	render() {
		let userView = (
			<div className="loadingView">Loading Threads...</div>
		);

		if(this.state.threads) {
			let threads = this.state.threads.map((thread) => {
				let names = thread.members.map((m) => m.name);
				let subtitle = 'No messages';
				if(thread.messages[0])
					subtitle = (thread.messages[0].content.type == 'text') ? thread.messages[0].content.text : 'Message from '+thread.messages[0].sender.name;
				return (
					<NavLink key={thread._id} to={'/threads/'+thread._id}>
						<ThreadBox
							onClick={() => this.handleSelect(thread._id)}
							title={names.join(', ')}
							subtitle={subtitle}
							thread={thread}
							onDelete={this.handleDelete.bind(this)}/>
					</NavLink>
				);
			});

			userView = (
				<div className="threadContainer">
					<div className="threadList">
						{threads}
					</div>
					<div className="newThread" onClick={this.toggleModal.bind(this)}>
						<h6>Create New Thread</h6>
					</div>
					<NewThread
						token={this.props.token}
						show={this.state.showModal}
						toggle={this.toggleModal.bind(this)}
						createdThread={this.createdThread.bind(this)}/>
				</div>
			);
		}
		return userView;
	}
}
