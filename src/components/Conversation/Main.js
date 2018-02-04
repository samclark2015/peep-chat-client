import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { MessageBubble } from 'components/Conversation/MessageBubble.js';
import { Message } from 'classes/Message.js';
import { Header } from 'components/Conversation/Header';
import { Footer } from './Footer.js';
import { ThreadStore } from 'classes/ThreadStore';
import Lightbox from 'react-image-lightbox';
import FontAwesome from 'react-fontawesome';
import 'stylesheets/Conversation.css';
import 'animate.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';

export class Conversation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			members: [],
			typing: {},
			thread: null,
			lightboxIdx: 0,
			showLightbox: false,
			lightboxImages: [],
			showScrollButton: false
		};

		this.shouldScroll = true;

		this.handleWSMesssage = this.handleWSMesssage.bind(this);
		this.sendTyping = this.sendTyping.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
		this.updateThread = this.updateThread.bind(this);
	}

	handleWSMesssage(message) {
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
			let t = Object.assign({}, this.state.typing);
			delete t[message.payload.sender._id];
			this.setState({typing: t});
		}
	}

	componentWillMount() {
		this.threadStore = ThreadStore.getInstance();
		this.threadStore.addEventListener(this.updateThread);
	}

	updateThread() {
		let thread = _.find(this.threadStore.data, {_id: this.props.thread});
		let images = [];
		if(thread) {
			thread.messages.forEach((message) => {
				if(message.content.type === 'image' && message.content.url) {
					images.push(message.content.url);
				}
			});
		}
		this.setState({
			thread: thread,
			lightboxImages: images
		});
	}

	componentDidMount() {
		this.props.data.ws.listeners.push(this.handleWSMesssage);
		if(this.state.thread)
			this.bindScrolling();
		this.scrollToBottom();
	}

	componentWillUnmount() {
		_.remove(this.props.data.ws.listeners, (o) => o === this.handleWSMesssage);
		this.threadStore.removeEventListener(this.updateThread);
	}

	componentWillReceiveProps(next) {
		if(next.thread && next.thread !== this.props.thread) {
			return;
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.state.thread && !prevState.thread)
			this.bindScrolling();
	}

	bindScrolling() {
		let e = $('.mainRow');
		let f = $('.mainRowInset');
		e.scroll(() =>{
			this.shouldScroll = f.height() - (e.scrollTop() + e.height()) <= 10;
		});
	}

	scrollToBottom() {
		let e = $('.mainRow');
		if(this.shouldScroll)
			e.scrollTop(e.prop('scrollHeight') - e.prop('clientHeight'));
		else
			this.setState({showScrollButton: true});
	}

	handleScrollButton() {
		this.anchor.scrollIntoView({behavior: 'smooth'});
		this.setState({showScrollButton: false});
	}

	sendMessage(content) {
		let message = new Message(this.props.data.user._id, this.props.thread, content);
		let data = {
			'type': 'message',
			'payload': message
		};
		this.props.data.ws.send(JSON.stringify(data));
	}

	sendTyping(content) {
		let message = new Message(this.props.data.user._id, this.props.thread, content);
		let data = {
			'type': 'typing',
			'payload': message
		};
		this.props.data.ws.send(JSON.stringify(data));
	}

	handleMessageClick(message) {
		if(message.content.type === 'image') {
			let idx = _.findIndex(this.state.lightboxImages, (o) => o === message.content.url);
			if(idx > -1)
				this.setState({lightboxIdx: idx, showLightbox: true});
		}
	}

	render() {
		let userView = (
			<div className="loadingView">Loading Conversation...</div>
		);

		if(this.state.thread) {
			let listItems = this.state.thread.messages.map((message) => {
				var style = {}, onClick = null;
				if(message.content.type == 'image')
					onClick = this.handleMessageClick.bind(this);
				if(message.sender._id == this.props.data.user._id) {
					style.backgroundColor = '#b5c1c9';
					style.float = 'right';
				}
				return (
					<div className="messageRow" key={message._id}>
						<MessageBubble
							style={style}
							className="messageBubble"
							message={message}
							onClick={onClick}
							onLoad={this.scrollToBottom.bind(this)}/>
					</div>
				);
			});


			let typing = () => {
				return Object.values(this.state.typing).map((message) => {
					return(
						<div key={'typing_'+message._id} className="messsageRow">
							<MessageBubble
								className="messageBubble animated infinite pulse"
								message={message}
								onLoad={this.scrollToBottom.bind(this)}
							/>
						</div>
					);
				});
			};

			let lightbox;
			if (this.state.showLightbox) {
				lightbox = (
					<Lightbox
						mainSrc={this.state.lightboxImages[this.state.lightboxIdx]}
						nextSrc={this.state.lightboxImages[(this.state.lightboxIdx + 1) % this.state.lightboxImages.length]}
						prevSrc={this.state.lightboxImages[(this.state.lightboxIdx + this.state.lightboxImages.length - 1) % this.state.lightboxImages.length]}
						onCloseRequest={() => this.setState({ showLightbox: false })}
						onMovePrevRequest={() =>
							this.setState({
								lightboxIdx: (this.state.lightboxIdx + this.state.lightboxImages.length - 1) % this.state.lightboxImages.length,
							})
						}
						onMoveNextRequest={() =>
							this.setState({
								lightboxIdx: (this.state.lightboxIdx + 1) % this.state.lightboxImages.length,
							})
						}/>
				);
			}

			userView = (
				<div className="conversation">
					<div className="headerRow">
						<Header
							token={this.props.data.user.token}
							thread={this.state.thread}
						/>
					</div>

					<div className="mainRow" id="mainRow" ref={this.mainRow}>
						<div className="mainRowInset">
							{listItems}
							{typing()}
							<div ref={(el) => { this.anchor = el; }} style={{ float:'left', clear: 'both' }}></div>
						</div>
					</div>

					<Footer onTyping={this.sendTyping} onSend={this.sendMessage} />


					{lightbox}
					{ this.state.showScrollButton ?
						<div onClick={this.handleScrollButton.bind(this)} className="scrollButton">
							<p>New Messages <FontAwesome name="chevron-down"/></p>
						</div> :
						null}
				</div>
			);
		}

		return userView;
	}
}
