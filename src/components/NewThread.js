import $ from 'jquery';
import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Tooltip } from 'reactstrap';
const settings = require('../api-config.js');

export class NewThread extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showTooltip: false,
			usersValue: ''
		};

		this.handleChange = this.handleChange.bind(this);
	}

	toggleTooltip(evt) {
		let val = !this.state.showTooltip;
		this.setState({showTooltip: val});
	}

	handleChange(event) {
		this.setState({usersValue: event.target.value});
	}

	createThread(){
		let mentionsRegex = new RegExp('@([a-zA-Z0-9\_\.]+)', 'gim');
		let text = this.state.usersValue;
		let matches = text.match(mentionsRegex);
		let body = {
			members: matches
		};

		$.ajax({
			url: settings.serverUrl + '/secure/threads',
			method: 'POST',
			headers: {'Authorization': 'Bearer ' + this.props.token},
			data: body,
			success: (data) => {
				console.log(data);
				this.props.createdThread(data._id);
				this.props.toggle();
			}
		});

	}

	render() {
		return (
			<Modal isOpen={this.props.show} className={this.props.className}>
				<ModalHeader toggle={this.props.toggle}>New Thread</ModalHeader>
				<ModalBody>
					<FormGroup>
						<Input type="text" name="users" id="UserAddBox" value={this.state.usersValue} onChange={this.handleChange} placeholder="Add some users..." onFocus={this.toggleTooltip.bind(this)} onBlur={this.toggleTooltip.bind(this)}/>
						<Tooltip placement="top" isOpen={this.state.showTooltip} target="UserAddBox">
							Add users using their @name, separated by spaces.
						</Tooltip>
					</FormGroup>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={this.createThread.bind(this)}>Create</Button>
					<Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
				</ModalFooter>
			</Modal>
		);
	}
}
