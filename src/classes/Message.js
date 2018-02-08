const ObjectID = require('bson').ObjectID;

export class Message {
	constructor(sender, thread, content) {
		this._id = new ObjectID();
		this.sender = sender; // User ID
		this.thread = thread; // Thread ID
		this.content = content;
		this.timestamp = new Date().toISOString();
	}
}
