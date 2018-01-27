import React, { Component } from 'react';

export class MessageBubble extends Component {
	render() {
		return (
			<div style={this.props.style} className={this.props.className}>
				<b>{this.props.sender}</b>
				<p >{this.props.content}</p>
			</div>
		);
	}
}
