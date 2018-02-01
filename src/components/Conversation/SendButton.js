import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

export class SendButton extends Component {
	render() {
		return (
			<button disabled={this.props.disabled} className="btn btn-secondary" onClick={this.props.onClick} type="submit">
				{!this.props.isSending ?  <FontAwesome name="paper-plane" /> : <FontAwesome spin name="spinner" />}
			</button>
		);
	}
}
