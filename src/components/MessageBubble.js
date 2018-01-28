import React, { Component } from 'react';

export class MessageBubble extends Component {
	render() {
		let content;
		switch(this.props.content.type) {
		case 'text':
			content = (
				<div style={this.props.style} className={this.props.className}>
					<b>{this.props.sender}</b>
					<p >{this.props.content.text}</p>
				</div>
			);

			break;
		case 'image':
			//let style = );
			content = (
				<div style={this.props.style} className={this.props.className+' image'}>
					<div className="footer">
						<b>{this.props.sender}</b>
					</div>
					<img src={this.props.content.url} />
				</div>
			);
			break;
		}

		return (
			<div>{content}</div>
		);
	}
}
