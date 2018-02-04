//import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { ThreadBox } from './ThreadBox.js';
import { NewThread } from './NewThread.js';
import { ThreadStore } from 'classes/ThreadStore';
import '../stylesheets/Threads.css';


export class Threads extends Component {
	constructor(props) {
		super(props);
		this.state = {
			threads: [],
			showModal: false
		};

		this.threadStore = ThreadStore.getInstance();
		this.updateThreads = this.updateThreads.bind(this);
	}

	componentWillMount() {
		this.threadStore.addEventListener(this.updateThreads);
	}

	componentDidMount() {

	}

	componentWillUnmount() {
		this.threadStore.removeEventListener(this.updateThreads);
	}

	updateThreads() {
		this.setState({threads: this.threadStore.data});
	}

	toggleModal() {
		let val = !this.state.showModal;
		this.setState({showModal: val});
	}

	createdThread(id) {
		this.props.history.push('/dashboard/threads/'+id);
	}

	handleSelect(id) {
		localStorage.setItem('last-thread', id);
		if(this.props.selectThread)
			this.props.selectThread(id);
	}

	handleDelete(id) {
		this.threadStore.deleteThread(id);
	}

	render() {
		let userView = (
			<div className="loadingView">Loading Threads...</div>
		);

		if(this.state.threads) {
			var threads = _.sortBy(this.state.threads, ['updatedAt']).reverse();
			threads = threads.map((thread) => {
				let names = thread.members.map((m) => m.name);
				let subtitle = 'No messages';
				let lastMessage = _.last(thread.messages);
				if(lastMessage)
					subtitle =
						lastMessage.content.type == 'text' ?
							lastMessage.content.text :
							'Message from '+lastMessage.sender.name;
				return (
					<ThreadBox
						key={thread._id}
						id={thread._id}
						title={names.join(', ')}
						subtitle={subtitle}
						thread={thread}
						onDelete={this.handleDelete.bind(this)}/>
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
