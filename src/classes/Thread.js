export class Thread {
	constructor(sender, recipient) {
		this.recipient = recipient;
		this.sender = sender;
		this.messages = [];
	}
}
