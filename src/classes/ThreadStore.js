import $ from 'jquery';
import _ from 'lodash';
import { DataStore } from 'classes/DataStore';
import { Queue } from 'classes/Queue';
import ReconnectingWebSocket from 'reconnecting-websocket';

const settings = require('api-config');

export class ThreadStore extends DataStore {
	constructor(url, token) {
		super(url, token);

		this.wsQueue = new Queue();

		this.ws = new ReconnectingWebSocket(settings.wsUrl);

		this.addMessage = this.addMessage.bind(this);
		this.deleteThread = this.deleteThread.bind(this);
		this.addUsers = this.addUsers.bind(this);
		this.createThread = this.createThread.bind(this);

		this.handleWSOpen = this.handleWSOpen.bind(this);
		this.handleWSMessage = this.handleWSMessage.bind(this);
		this.handleMessage = this.handleMessage.bind(this);

		this.ws.listeners = [];
		this.ws.onopen = this.handleWSOpen;
		this.ws.onmessage = this.handleWSMessage;
		this.ws.listeners.push(this.handleMessage);
	}


	handleMessage(message) {
		if(message.type === 'typing') {
			let thread = _.find(this.data, {_id: message.payload.thread});
			let existingMessage = _.find(thread.messages, {_id: message.payload._id});
			if(existingMessage) {
				if(message.payload.content.type == 'text' && message.payload.content.text === '') {
					_.remove(thread.messages, {_id: existingMessage._id});
				} else {
					Object.assign(existingMessage, message.payload);
				}
				this.notifyListeners();
			} else {
				let newMessage = Object.assign({isTyping: true}, message.payload);
				this.addMessage(newMessage);
			}
		} else if(message.type === 'message') {
			let thread = _.find(this.data, {_id: message.payload.thread});
			let existingMessage = _.find(thread.messages, {_id: message.payload._id});
			if(existingMessage) {
				Object.assign(existingMessage, message.payload);
				delete existingMessage.isTyping;
				this.notifyListeners();
			} else {
				let newMessage = Object.assign({}, message.payload);
				this.addMessage(newMessage);
			}
		}
	}

	handleWSMessage(message) {
		let data = JSON.parse(message.data);
		this.ws.listeners.forEach((listener) => {
			listener(data);
		});
	}


	handleWSOpen(event) {
		let data = {
			'type': 'signon',
			'payload': this.token
		};
		this.ws.send(JSON.stringify(data));
		event.preventDefault();
	}

	sendTyping(message) {
		let data = {
			'type': 'typing',
			'payload': message
		};
		this.ws.send(JSON.stringify(data));
	}

	sendMessage(message) {
		let data = {
			'type': 'message',
			'payload': message
		};
		this.ws.send(JSON.stringify(data));
	}

	addMessage(message) {
		let thread = _.find(this.data, {_id: message.thread});
		if(thread) {
			thread.messages.push(message);
			thread.updatedAt = new Date().toISOString();
			this.notifyListeners();
		}
	}

	createThread(members) {
		let body = {
			members: members
		};
		return new Promise((res) => {
			$.ajax({
				url: settings.serverUrl + '/secure/threads',
				method: 'POST',
				headers: {'Authorization': 'Bearer ' + this.token},
				data: body,
				success: (data) => {
					this.data.push(data);
					res(data);
				}
			});
		});
	}

	deleteThread(id) {
		$.ajax({
			url: settings.serverUrl + '/secure/threads/'+id,
			headers: {'Authorization': 'Bearer ' + this.token},
			method: 'DELETE',
			success: () => {
				_.remove(this.data, {_id: id});
				this.notifyListeners();
			}
		});
	}

	addUsers(id, members) {
		return $.ajax(settings.serverUrl + '/secure/threads/' + id,
			{
				method: 'PUT',
				data: {
					members: members
				}
			})
			.then((data) => {
				let thread = _.find(this.data, {_id: data._id});
				if(thread) {
					thread.members = data.members;
					this.notifyListeners();
				}
				return data;
			});
	}

	handleWSMesssage(message) {
		if(message.type === 'message') {
			this.addMessage(message.payload);
		}
	}

	sendReads(threadId, userId) {
		let thread = _.find(this.data, {_id: threadId});
		let unreadMessages = _.filter(thread.messages, (message) => !(
			message.readBy && _.includes(message.readBy, userId)
		)).map((m) => m._id);

		let data = {
			'type': 'read',
			'payload': {
				messages: unreadMessages,
				thread: threadId
			}
		};

		this.ws.send(JSON.stringify(data));
	}

	static getInstance(url, token) {
		let instance = ThreadStore._instance;
		if(instance) {
			return instance;
		} else if(url && token) {
			ThreadStore._instance = new ThreadStore(url, token);
			return ThreadStore._instance;
		} else {
			throw new Error('No instance found. Please supply URL and Token');
		}
	}

	static reset() {
		ThreadStore._instance = null;
	}

}
