import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { UserLabel } from './UserLabel.js';
import { MessageBubble } from './MessageBubble.js';
import { Message } from '../classes/Message.js';
import { InputGroup, InputGroupAddon, Button, Input } from 'reactstrap';
import '../stylesheets/Conversation.css';
import 'animate.css';
const settings = require('../api-config.js');

export class Conversation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			members: [],
			messageValue: '',
			typing: null,
			thread: null
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		// TODO: delete fn on unmount
		this.props.data.ws.listeners.push((message) => {
			if(message.type === 'typing' && message.payload.thread === this.props.thread) {
				if(message.payload.content === '')
					this.setState({typing: message.null});
				else
					this.setState({typing: message.payload});
			} else if(message.type === 'message' && message.payload.thread === this.props.thread) {
				var thread = Object.assign({}, this.state.thread);
				thread.messages.push(message.payload);
				this.setState({typing: null, thread: thread});
			}
			this.scrollToBottom();
		});
	}

	componentWillReceiveProps(next) {
		if(next.thread && next.thread !== this.props.thread) {
			$.ajax({
				url: settings.serverUrl + '/secure/threads/'+next.thread,
				headers: {'Authorization': 'Bearer ' + this.props.data.user.token},
				success: (data) => {
					this.setState({
						thread: data
					});
					this.scrollToBottom();
				}
			});
		}
	}

	scrollToBottom() {
		if(this.anchor)
			this.anchor.scrollIntoView({ behavior: 'smooth' });
	}

	handleChange(event) {
		this.setState({messageValue: event.target.value});
		let message = new Message(this.props.data.user._id, this.props.thread, event.target.value);
		let data = {
			'type': 'typing',
			'payload': message
		};

		this.props.data.ws.send(JSON.stringify(data));
	}

	handleSubmit(event) {
		// TODO thread sends message
		let message = new Message(this.props.data.user._id, this.props.thread, this.state.messageValue);
		let data = {
			'type': 'message',
			'payload': message
		};
		this.props.data.ws.send(JSON.stringify(data));
		this.setState({messageValue: ''});
		event.preventDefault();
	}

	render() {
		if(this.state.thread) {
			let listItems = this.state.thread.messages.map((message, idx) => {
				var style = {};
				if(message.sender._id == this.props.data.user._id) {
					style.backgroundColor = '#b5c1c9';
					style.float = 'right';
				}
				return (
					<div className="messageRow" key={idx}>
						<MessageBubble
							style={style}
							className="messageBubble"
							sender={message.sender.name}
							content={message.content} />
					</div>
				);
			}
			);

			let typing = () => {
				if(this.state.typing == null)
					return null;
				else
					return(
						<div className="messsageRow">
							<MessageBubble
								className="messageBubble animated infinite pulse"
								sender={this.state.typing.sender.name}
								content={this.state.typing.content} />
						</div>
					);
			};

			let names = this.state.thread.members.map((m) => m.name);

			return (
				<div className="conversation">
					<div className="headerRow">
						<h5>
							{names.join(', ')}
						</h5>
					</div>

					<div className="mainRow" id="mainRow">
						{listItems}
						{typing()}
						<div ref={(el) => { this.anchor = el; }} style={{ float:'left', clear: 'both' }}></div>
					</div>

					<div className="footerRow">
						<form onSubmit={this.handleSubmit}>
							<InputGroup>
								<Input placeholder="Send a message..." value={this.state.messageValue} onChange={this.handleChange} />
								<div className="input-group-append">
									<button className="btn btn-secondary" type="submit">Send</button>
								</div>
							</InputGroup>
						</form>
					</div>
				</div>
			);
		} else {
			return <h3>Select a Conversation</h3>;
		}
	}
}
