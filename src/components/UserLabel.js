import React, { Component } from 'react';

export class UserLabel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			label: "",
		}
	}

	componentWillMount() {
		var label = ""
		let promises = this.props.ids.map((m) =>
			this.props.lookup.get(m)
		);
		Promise.all(promises).then((users) => {
			users.forEach((user) => {
				label += user.username + ", "
			});
			this.setState({label: label});
		})
	}

  render() {
    return this.state.label;
  }
}
