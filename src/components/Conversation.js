import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { UserLabel } from './UserLabel.js';
import { MessageBubble } from './MessageBubble.js';
import { Message } from '../classes/Message.js';
import { InputGroup, Input, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import GiphySelect from 'react-giphy-select';
import 'react-giphy-select/lib/styles.css';
import '../stylesheets/Conversation.css';
import 'animate.css';
const settings = require('../api-config.js');

export class Conversation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			members: [],
			messageValue: '',
			typing: {},
			thread: null,
			gifPopover: false
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillMount() {
		$.ajax({
			url: settings.serverUrl + '/secure/threads/'+this.props.thread,
			headers: {'Authorization': 'Bearer ' + this.props.data.user.token},
			success: (data) => {
				this.setState({
					thread: data
				});
				this.scrollToBottom();
			}
		});
	}

	componentDidMount() {
		// TODO: delete fn on unmount
		this.props.data.ws.listeners.push((message) => {
			if(message.type === 'typing' && message.payload.thread === this.props.thread) {
				let t = Object.assign({}, this.state.typing);
				if(message.payload.content === '') {
					delete t[message.payload.sender._id];
					this.setState({typing: t});
				} else {
					t[message.payload.sender._id] = message.payload;
					this.setState({typing: t});
				}
			} else if(message.type === 'message' && message.payload.thread === this.props.thread) {
				var thread = Object.assign({}, this.state.thread);
				thread.messages.push(message.payload);
				let t = Object.assign({}, this.state.typing);
				delete t[message.payload.sender._id];
				this.setState({typing: t, thread: thread});
			}
			this.scrollToBottom();
		});
	}

	componentWillReceiveProps(next) {
		if(next.thread && next.thread !== this.props.thread) {
			return;
		}
	}

	scrollToBottom() {
		if(this.anchor)
			this.anchor.scrollIntoView({ behavior: 'smooth' });
	}

	handleChange(event) {
		this.setState({messageValue: event.target.value});
		let content = {
			type: 'text',
			text: event.target.value
		};
		let message = new Message(this.props.data.user._id, this.props.thread, content);
		let data = {
			'type': 'typing',
			'payload': message
		};

		this.props.data.ws.send(JSON.stringify(data));
	}

	handleSubmit(event) {
		// TODO thread sends message
		if(!(!this.state.messageValue || /^\s*$/.test(this.state.messageValue))) {
			let content = {
				type: 'text',
				text: this.state.messageValue
			};
			let message = new Message(this.props.data.user._id, this.props.thread, content);
			let data = {
				'type': 'message',
				'payload': message
			};
			this.props.data.ws.send(JSON.stringify(data));
			this.setState({messageValue: ''});
		}
		event.preventDefault();
	}

	sendGif(url) {
		let content = {
			type: 'image',
			url: url
		};
		let message = new Message(this.props.data.user._id, this.props.thread, content);
		let data = {
			'type': 'message',
			'payload': message
		};
		this.props.data.ws.send(JSON.stringify(data));
		this.setState({gifPopover: !this.state.gifPopover});
		//event.preventDefault();
	}

	render() {
		if(!this.state.thread)
			return <div></div>;
		else {
			let listItems = this.state.thread.messages.map((message, idx) => {
				var style = {};
				if(message.sender._id == this.props.data.user._id) {
					style.backgroundColor = '#b5c1c9';
					style.float = 'right';
				}
				return (
					<div className="messageRow" key={message._id}>
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
				return Object.values(this.state.typing).map((t, i) => {
					return(
						<div key={i} className="messsageRow">
							<MessageBubble
								className="messageBubble animated infinite pulse"
								sender={t.sender.name}
								content={t.content} />
						</div>
					);
				});

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
								<div className="input-group-prepend">
									<button className="btn btn-secondary" id="gifButton" type="button" onClick={()=>{this.setState({gifPopover: !this.state.gifPopover});}}>GIF</button>
								</div>
								<Input placeholder="Send a message..." value={this.state.messageValue} onChange={this.handleChange} />
								<div className="input-group-append">
									<button className="btn btn-secondary" type="submit">Send</button>
								</div>
							</InputGroup>
							<Popover
								placement="top"
								isOpen={this.state.gifPopover}
								target="gifButton"
								toggle={()=>{this.setState({gifPopover: !this.state.gifPopover});}}>
								<PopoverBody>
									<GiphySelect onEntrySelect={(e) => {console.log(e); this.sendGif(e.images.fixed_width.url);}} />
								</PopoverBody>
							</Popover>
						</form>
					</div>
				</div>
			);

		}

	}
}
