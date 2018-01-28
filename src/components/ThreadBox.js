import React, { Component } from 'react';
import '../stylesheets/ThreadBox.css';

export class ThreadBox extends Component {
	handleClick() {
		this.props.onDelete(this.props.thread._id);
	}

	render() {
		return (
			<div className="threadboxContainer">
				<div className="threadboxContent" onClick={this.props.onClick}>
					<h6>{this.props.title}</h6>
				</div>
				<div onClick={this.handleClick.bind(this)}><i className="threadboxDelete fa fa-lg fa-times-circle" /></div>
			</div>
		);
	}
}
