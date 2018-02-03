import $ from 'jquery';
import _ from 'lodash';
import { DataStore } from 'classes/DataStore';

export class ThreadStore extends DataStore {

	addMessage(message) {
		let thread = _.find(this.data, {_id: message.thread});
		thread.push(message);
		this.notifyListeners();
	}

}

ThreadStore.getInstance = (url, token) => {
	let instance = ThreadStore._instance;
	if(instance) {
		return instance;
	} else if(url && token) {
		ThreadStore._instance = new DataStore(url, token);
		return ThreadStore._instance;
	} else {
		throw new Error('No instance found. Please supply URL and Token');
	}
};
