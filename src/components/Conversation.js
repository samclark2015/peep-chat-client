import React, { Component } from 'react';
import _ from 'lodash';
import { UserLabel } from './UserLabel.js';

export class Conversation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      messageValue: "",
      typing: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.ws.listeners.push((message) => {
      if(message.type === 'typing' && message.to === this.props.thread.recipient) {
        this.setState({typing: message.payload});
      } else if(message.type === 'message' && message.to === this.props.thread.recipient) {
        this.setState({typing: null});
      }
    })
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    let data = {
      "type": "typing",
      "payload": {
        "to": this.toBox.value,
        "from": this.state.user.name,
        "message": event.target.value
      }
    }
    this.props.ws.send(JSON.stringify(data))
  }

  handleSubmit(event) {
    // TODO thread sends message
    this.props.thread.sendMessage(this.state.messgeValue);
    this.setState({messageValue: ""});
    event.preventDefault();
  }

  render() {
    let listItems = this.props.thread.messages.map((message, idx) =>
      <li key={idx}><UserLabel lookup={this.props.lookup} ids={[message.sender]} />: {message.content}</li>
    );

		console.log(this.props.thread.messages, listItems);

    let typing = (this.props.typing == null) ? null : (<li><i>{this.props.typing.from}: {this.props.typing.message}</i></li>)

    return (
      <div className="App">
      <h2><UserLabel lookup={this.props.lookup} ids={this.props.thread.members} /></h2>

      <ul>
				{listItems}
        {typing}
      </ul>

      <form onSubmit={this.handleSubmit}>
        <label>
          Message:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Send" />
      </form>
      </div>
    )
  }
}
