import $ from 'jquery';
import _ from 'lodash';
import { DataStore } from 'classes/DataStore';

const settings = require('api-config');

export class ThreadStore extends DataStore {
	constructor(url, token) {
		super(url, token);

		this.addMessage = this.addMessage.bind(this);
		this.handleWSMesssage = this.handleWSMesssage.bind(this);
		this.deleteThread = this.deleteThread.bind(this);
		this.addUsers = this.addUsers.bind(this);
		this.createThread = this.createThread.bind(this);
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

}
