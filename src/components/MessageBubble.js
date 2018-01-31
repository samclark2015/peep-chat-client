import React, { Component } from 'react';
import ImgFallback from 'react-img-fallback';
import Img from 'react-image';
import { FormattedTime } from 'react-intl';
const moment = require('moment');

const fallback = 'https://www.makeupgeek.com/content/wp-content/themes/makeup-geek/images/placeholder-square.svg';

export class MessageBubble extends Component {
	componentWillMount() {
	}

	componentDidMount() {
		if(this.props.message.content.type === 'text')
			this.props.onLoad();
	}

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
			content = (
				<div title={timestamp} style={this.props.style} className={this.props.className+' image'}>
					<div className="footer">
						<b>{this.props.message.sender.name}</b>
					</div>
					<Img
						src={[this.props.message.content.url, fallback]}
						onLoad={this.props.onLoad}
						alt="Image Message">
					</Img>
				</div>
			);
			break;
		}

		let style = {};
		if(this.props.onClick)
			style.cursor = 'pointer';

		return (
			<div style={style} onClick={() => this.props.onClick(this.props.message)}>{content}</div>
		);
	}
}
