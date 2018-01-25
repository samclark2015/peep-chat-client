export class Thread {
  constructor(ws, sender, recipient) {
    this.ws = ws;
    this.ws.listeners.push(this.onMessage.bind(this));
    this.recipient = recipient;
    this.sender = sender;
    this.messages = [];
  }

  onMessage(message) {
    if(message.type === 'message' && message.payload.from === this.recipient) {
      this.messages.push(message.payload);
    }
  }

  sendMessage(message) {
    let data = {
      "type": "message",
      "payload": {
        "to": this.recipient,
        "from": this.sender,
        "message": this.message
      }
    }
    this.props.ws.send(JSON.stringify(data));
  }
}
