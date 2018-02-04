import $ from 'jquery';
import React, { Component } from 'react';
import { Popover, PopoverBody } from 'reactstrap';
import { SendButton } from './SendButton';
import FontAwesome from 'react-fontawesome';
import GiphySelect from 'react-giphy-select';
import 'react-giphy-select/lib/styles.css';

export class Footer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imageUploadSrc: null,
			messageText: '',
			showPopover: false,
			imageUpload: null,
			sendEnabled: false,
			showOptions: false,
			isSending: false
		};

		this.toggleGifPopover = this.toggleGifPopover.bind(this);
		this.toggleImageSelect = this.toggleImageSelect.bind(this);
		this.toggleOptions = this.toggleOptions.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleImageSelect = this.handleImageSelect.bind(this);
		this.handleGifSelect = this.handleGifSelect.bind(this);
		this.uploadImage = this.uploadImage.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	handleKeyPress(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			this.handleSubmit();
		}
	}

	handleChange(event) {
		var sendEnabled = true;
		if(event.target.value === '' && !this.state.imageUpload)
			sendEnabled = false;
		this.setState({messageText: event.target.value, sendEnabled: sendEnabled});
		let content = {
			type: 'text',
			text: event.target.value
		};
		this.props.onTyping(content);
	}

	handleSubmit() {
		if(!this.state.sendEnabled)
			return;

		let sendText = () => {
			if(!(!this.state.messageText || /^\s*$/.test(this.state.messageText))) {
				let content = {
					type: 'text',
					text: this.state.messageText
				};
				this.props.onSend(content);
				this.setState({messageText: '', sendEnabled: false});
			}
		};

		if(this.state.imageUpload) {
			this.setState({sendEnabled: false, isSending: true});
			this.uploadImage()
				.then((data) => {
					let content = {
						type: 'image',
						url: data.data.link
					};
					this.props.onSend(content);
					this.setState({imageUpload: null, imageUploadSrc: null, sendEnabled: true, isSending: false});
					sendText();
				}).catch((err) => {
					// TODO actual error handling
					console.warn(err);
					this.setState({sendEnabled: true, isSending: false});
				});
		} else sendText();
	}

	handleImageSelect(event) {
		this.setState({imageUpload: event.target.files[0], sendEnabled: true});
		var reader = new FileReader();
		reader.onload = (e) => {
			this.setState({imageUploadSrc: e.target.result});
		};
		reader.readAsDataURL(event.target.files[0]);
	}

	handleGifSelect(data) {
		let content = {
			type: 'image',
			url: data.images.fixed_width.url
		};
		this.props.onSend(content);
	}

	toggleGifPopover() {
		this.setState({showPopover: !this.state.showPopover, showOptions: false});
	}

	toggleOptions() {
		this.setState({showOptions: !this.state.showOptions});
	}

	toggleImageSelect() {
		this.setState({showOptions: false});
		$('#imageInput').click();
	}

	uploadImage() {
		var formData = new FormData();
		formData.append('image',this.state.imageUpload);
		return $.ajax('https://api.imgur.com/3/image', {
			method: 'POST',
			headers: {
				'Authorization': 'Client-ID a93777040a5bae4'
			},
			data: formData,
			contentType: false,
			processData: false
		});
	}

	render() {
		return (
			<div className="footerRow">
				<button className="btn btn-secondary" id="plusButton" type="button" onClick={this.toggleOptions}>
					<FontAwesome name="plus" />
				</button>
				<div className="messageFooterContainer">
					{ this.state.imageUploadSrc ? <img width="50" src={this.state.imageUploadSrc} /> : null}
					<input
						className="messageTextarea"
						type="text"
						value={this.state.messageText}
						onChange={this.handleChange}
						onKeyPress={this.handleKeyPress}
						placeholder="Send a message..."
					/>
				</div>
				<SendButton disabled={!this.state.sendEnabled} onClick={this.handleSubmit} isSending={this.state.isSending}/>

				<input id="imageInput" name="image" onChange={this.handleImageSelect} type="file" />

				<Popover
					placement="auto-start"
					isOpen={this.state.showPopover}
					target="plusButton"
					toggle={this.toggleGifPopover}>
					<PopoverBody>
						<GiphySelect onEntrySelect={this.handleGifSelect} />
					</PopoverBody>
				</Popover>

				<Popover
					placement="auto-start"
					isOpen={this.state.showOptions}
					target="plusButton"
					toggle={this.toggleOptions}>
					<PopoverBody>
						<button className="btn btn-secondary" id="gifButton" type="button" onClick={this.toggleGifPopover}>GIF</button>
						<button className="btn btn-secondary" id="imgButton" type="button" onClick={this.toggleImageSelect}>IMG</button>
					</PopoverBody>
				</Popover>
			</div>
		);
	}
}
