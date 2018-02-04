import $ from 'jquery';
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Popover, PopoverBody } from 'reactstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { ThreadStore } from 'classes/ThreadStore';

const settings = require('api-config');

export class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			popoverOpen: false,
			options: [],
			isLoading: false,
			selected: []
		};

		this.threadStore = ThreadStore.getInstance();

		this.togglePopover = this.togglePopover.bind(this);
		this.addUsers = this.addUsers.bind(this);
	}

	togglePopover() {
		this.setState({popoverOpen: !this.state.popoverOpen});
	}

	getUsers(query) {
		$.ajax({
			url: settings.serverUrl + '/secure/users?b='+query
		})
			.then((data) => {
				this.setState({options: data, isLoading: false});
			});
	}

	addUsers(e) {
		e.preventDefault();
		let usernames = this.state.selected.map((o) => o.username);
		this.threadStore.addUsers(this.props.thread._id, usernames)
			.then(() => {
				this.togglePopover();
			});
	}

	render() {
		let names = this.props.thread.members.map((m) => m.name);
		return (
			<Fragment>
				<span>To: {names.join(', ')}</span><i onClick={this.togglePopover} id="addUserButton" className="fa fa-lg fa-plus-circle" />

				<Popover placement="bottom" isOpen={this.state.popoverOpen} target="addUserButton" toggle={this.togglePopover}>
					<PopoverBody>
						<form onSubmit={this.addUsers}>
							<AsyncTypeahead
								multiple
								autoFocus
								labelKey="name"
								isLoading={this.state.isLoading}
								onSearch={query => {
									this.setState({isLoading: true});
									this.getUsers(query);
								}}
								filterBy={(option) => {
									return !_.find(this.props.members, option);
								}}
								onChange={(selected) => this.setState({selected: selected})}
								options={this.state.options}
								placeholder="Type to add users..."
								submitFormOnEnter
							/>
						</form>
					</PopoverBody>
				</Popover>
			</Fragment>
		);
	}
}
