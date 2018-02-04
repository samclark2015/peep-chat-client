import React, { Component } from 'react';
import { Popover, PopoverBody, Button, ButtonGroup } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import '../stylesheets/ThreadBox.css';

export class ThreadBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showPopver: false
		};

		this.handleDelete = this.handleDelete.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.togglePopover = this.togglePopover.bind(this);
	}

	handleDelete() {
		this.togglePopover();
		this.props.onDelete(this.props.thread._id);
	}

	handleClick() {
		this.setState({showPopover: true});
	}

	togglePopover() {
		this.setState({showPopover: !this.state.showPopover});
	}

	render() {
		return (
			<div className="threadboxContainer">
				<div className="threadboxContent">
					<NavLink to={'/dashboard/threads/'+this.props.id}>
						<h6>{this.props.title}</h6>
						<p>{this.props.subtitle}</p>
					</NavLink>
				</div>
				<div onClick={this.handleClick} id={'threadDelete'+this.props.thread._id}><i className="threadboxDelete fa fa-lg fa-times-circle" /></div>

				<Popover
					placement="left"
					isOpen={this.state.showPopover}
					target={'threadDelete'+this.props.thread._id}
					toggle={this.togglePopover}>
					<PopoverBody>
						<ButtonGroup>
							<Button color="danger" onClick={this.handleDelete}>Remove</Button>{' '}
						</ButtonGroup>
					</PopoverBody>
				</Popover>
			</div>
		);
	}
}
