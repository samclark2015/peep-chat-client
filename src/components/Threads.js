import $ from 'jquery';
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
	}

	componentWillMount() {
		this.loadThreads();
	}

	componentDidMount() {
	}

	loadThreads() {
		$.ajax({
			url: settings.serverUrl + '/secure/threads',
			headers: {'Authorization': 'Bearer ' + this.props.token},
			success: (data) => {
				this.setState({threads: data});
				/*let id = localStorage.getItem('last-thread');
				if(id) {
					this.props.selectThread(id);
				} else {
					this.props.selectThread(this.state.threads[0]._id);
				}*/
			}
		});
	}

	toggleModal(evt) {
		let val = !this.state.showModal;
		this.setState({showModal: val});
	}

	createdThread(id) {
		this.loadThreads();
		this.props.selectThread(id);
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
