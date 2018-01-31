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
			threads: [],
			showModal: false
		};

		this.wsListener = this.wsListener.bind(this);
	}

	wsListener(message) {
		if(message.type === 'message'){
			/*let threads = this.state.threads;
			//console.log(threads);
			let thread = _.find(threads, {'_id': message.payload.thread});
			//console.log(thread);
			//thread.messages.push(message.payload);
			//_.remove(threads, thread);
			//threads.push(thread);
			thread.updatedAt = new Date(Date.now()).toISOString();
			_.sortBy(threads, ['updatedAt']);
			this.setState({threads: threads});*/
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
		let d = _.remove(this.props.ws.listeners, (o) => o === this.wsListener);
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

	toggleModal(evt) {
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
			success: (data) => {
				this.loadThreads();
			}
		});
	}

	render() {
		let threads = this.state.threads.map((thread) => {
			let names = thread.members.map((m) => m.name);
			return (
				<NavLink key={thread._id} to={'/threads/'+thread._id}>
					<ThreadBox
						onClick={() => this.handleSelect(thread._id)}
						title={names.join(', ')}
						subtitle=""
						thread={thread}
						onDelete={this.handleDelete.bind(this)}/>
				</NavLink>
			);
		});

		return (
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
}
