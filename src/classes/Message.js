export class Message {
	constructor(sender, thread, content) {
		this.sender = sender; // User ID
		this.thread = thread; // Thread ID
		this.content = content;
	}
}
