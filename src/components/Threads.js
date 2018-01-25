import React, { Component } from 'react';
import $ from 'jquery';
import { UserLabel } from './UserLabel.js';

export class Threads extends Component {
	constructor(props) {
		super(props);
		this.state = {
			threads: []
		}
	}

	componentWillMount() {
		$.ajax({
			url: "http://localhost:8080/secure/threads",
			headers: {"Authorization": "Bearer " + this.props.token},
			success: (data) => {
				this.setState({threads: data});
			}
		});
	}

  render() {

		let threads = this.state.threads.map((thread, index) =>
			<li key={index} onClick={() => this.props.selectThread(thread)}>
				<UserLabel lookup={this.props.lookup} ids={thread.members} />
			</li>
		);

    return (
      <div>
				<ul>
				{threads}
				</ul>
			</div>
    );
  }
}
