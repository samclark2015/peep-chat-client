import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { MessageBubble } from './MessageBubble.js';
import { Message } from '../classes/Message.js';
import { InputGroup, Input, Popover, PopoverBody, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import GiphySelect from 'react-giphy-select';
import ImageUploader from 'react-images-upload';
import 'react-giphy-select/lib/styles.css';
import '../stylesheets/Conversation.css';
import 'animate.css';
import Lightbox from 'react-image-lightbox';
import FontAwesome from 'react-fontawesome';
const settings = require('../api-config.js');
const ResizeSensor = require('css-element-queries/src/ResizeSensor');

export class Conversation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			members: [],
			messageValue: '',
			typing: {},
			thread: null,
			gifPopover: false,
			imgModal: false,
			imageUpload: null,
			lightboxIdx: 0,
			showLightbox: false,
			lightboxImages: [],
			showScrollButton: false
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleWSMesssage = this.handleWSMesssage.bind(this);
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
			var thread = Object.assign({}, this.state.thread);
			thread.messages.push(message.payload);
			let t = Object.assign({}, this.state.typing);
			delete t[message.payload.sender._id];
			this.setState({typing: t, thread: thread});
		}
	}

	componentWillMount() {
		$.ajax({
			url: settings.serverUrl + '/secure/threads/'+this.props.thread,
			headers: {'Authorization': 'Bearer ' + this.props.data.user.token},
			success: (data) => {
				let images;
				if(data) {
					images = data.messages.map((message) => {
						if(message.content.type === 'image') {
							return message.content.url;
						}
					});
				}
				this.setState({
					thread: data,
					lightboxImages: images
				});
			}
		});
	}

	componentDidMount() {
		// TODO: delete fn on unmount
		this.props.data.ws.listeners.push(this.handleWSMesssage);
		this.shouldScroll = true;
	}

	componentWillUnmount() {
		_.remove(this.props.data.ws.listeners, (o) => o === this.handleWSMesssage);
	}

	componentWillReceiveProps(next) {
		if(next.thread && next.thread !== this.props.thread) {
			return;
		}
	}

	componentDidUpdate() {
		let e = $('.mainRow');
		let f = $('.mainRowInset');
		e.scroll(() =>{
			this.shouldScroll = f.height() - (e.scrollTop() + e.height()) <= 1;
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

	toggleImgModal() {
		this.setState({imgModal: !this.state.imgModal});
	}

	toggleGifPopver() {
		this.setState({gifPopover: !this.state.gifPopover});
	}

	uploadImage() {
		var formData = new FormData();
		formData.append('image',this.state.imageUpload);
		$.ajax('https://api.imgur.com/3/image', {
			method: 'POST',
			headers: {
				'Authorization': 'Client-ID a93777040a5bae4'
			},
			data: formData,
			contentType: false,
			processData: false
		}).then((data) => {
			this.sendImage(data.data.link);
			this.setState({imageUpload: null, imgModal: false});
		}).catch((err) => {
			console.error(err);
			this.setState({imageUpload: null, imgModal: false});
		});
	}

	sendGif(data) {
		this.sendImage(data.images.fixed_width.url);
	}

	sendImage(url) {
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
							message={message}
							onClick={this.handleMessageClick.bind(this)}
							onLoad={this.scrollToBottom.bind(this)}/>
					</div>
				);
			}
			);

			let typing = () => {
				return Object.values(this.state.typing).map((message) => {
					return(
						<div key={'typing_'+message._id} className="messsageRow">
							<MessageBubble
								className="messageBubble animated infinite pulse"
								message={message}/>
						</div>
					);
				});

			};

			let names = this.state.thread.members.map((m) => m.name);

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
						}
					/>
				);
			}

			userView = (
				<div className="conversation">
					<div className="headerRow">
						To: {names.join(', ')}
					</div>

					<div className="mainRow" id="mainRow" ref={this.mainRow}>
						<div className="mainRowInset">
							{listItems}
							{typing()}
							<div ref={(el) => { this.anchor = el; }} style={{ float:'left', clear: 'both' }}></div>
						</div>
					</div>

					<div className="footerRow">
						<form onSubmit={this.handleSubmit}>
							<InputGroup>
								<div className="input-group-prepend">
									<button className="btn btn-secondary" id="gifButton" type="button" onClick={this.toggleGifPopver.bind(this)}>GIF</button>
								</div>
								<div className="input-group-prepend">
									<button className="btn btn-secondary" id="imgButton" type="button" onClick={this.toggleImgModal.bind(this)}>IMG</button>
								</div>
								<Input placeholder="Send a message..." value={this.state.messageValue} onChange={this.handleChange} />
								<div className="input-group-append">
									<button className="btn btn-secondary" type="submit">Send</button>
								</div>
							</InputGroup>

							<Modal isOpen={this.state.imgModal} toggle={this.toggleImgModal.bind(this)} className={this.props.className}>
								<ModalHeader toggle={this.toggleImgModal.bind(this)}>Send Image</ModalHeader>
								<ModalBody>
									<label htmlFor="imageInput" className="imageInputLabel">IMG</label>
									<input id="imageInput" name="image" onChange={(e)=>this.setState({imageUpload: e.target.files[0]})} type="file" />
								</ModalBody>
								<ModalFooter>
									<Button color="success" onClick={this.uploadImage.bind(this)}>Send</Button>
								</ModalFooter>
							</Modal>
							<Popover
								placement="top"
								isOpen={this.state.gifPopover}
								target="gifButton"
								toggle={this.toggleGifPopver.bind(this)}>
								<PopoverBody>
									<GiphySelect onEntrySelect={this.sendGif.bind(this)} />
								</PopoverBody>
							</Popover>

						</form>
					</div>
					{lightbox}
					{ this.state.showScrollButton ? <div onClick={this.handleScrollButton.bind(this)} className="scrollButton"><p>New Messages <FontAwesome name="chevron-down"/></p></div> : null}
				</div>
			);
		}
		return userView;
	}
}
