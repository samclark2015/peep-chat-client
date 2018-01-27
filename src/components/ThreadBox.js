import React, { Component } from 'react';

const divStyle = {
	cursor: 'pointer',
	height: '50px',
	borderBottom: '1px solid grey',
	padding: '5px'
};

export class ThreadBox extends Component {
	render() {
		return (
			<div style={divStyle} onClick={this.props.onClick}>
				<h6>{this.props.title}</h6>
				<p>{this.props.subtitle}</p>
			</div>
		);
	}
}
