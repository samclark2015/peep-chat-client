import React, { Component } from 'react';
import ImgFallback from 'react-img-fallback';
import { FormattedTime } from 'react-intl';
const moment = require('moment');

export class MessageBubble extends Component {
	render() {
		let content;
		let timestamp = moment(this.props.message.timestamp).calendar();
		switch(this.props.message.content.type) {
		case 'text':
			content = (
				<div title={timestamp} style={this.props.style} className={this.props.className}>
					<b>{this.props.message.sender.name}</b>
					<p >{this.props.message.content.text}</p>
				</div>
			);

			break;
		case 'image':
			//let style = );
			content = (
				<div title={timestamp} style={this.props.style} className={this.props.className+' image'}>
					<div className="footer">
						<b>{this.props.message.sender.name}</b>
					</div>
					<ImgFallback
						src={this.props.message.content.url}
						alt="Image Message"
						fallback="https://www.makeupgeek.com/content/wp-content/themes/makeup-geek/images/placeholder-square.svg">
					</ImgFallback>
				</div>
			);
			break;
		}

		return (
			<div>{content}</div>
		);
	}
}
