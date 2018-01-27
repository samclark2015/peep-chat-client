import React, { Component } from 'react';

export class UserLabel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			label: '',
		};
	}

	componentWillMount() {
		let promises = this.props.ids.map((m) =>
			this.props.lookup.get(m)
		);
		Promise.all(promises).then((users) => {
			let names = users.map((u) => u.name);
			let label = names.join(', ');
			this.setState({label: label});
		});
	}

	render() {
		return this.state.label;
	}
}
