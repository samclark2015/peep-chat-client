import React, { Component } from 'react';
import { Conversation } from './Conversation.js';
//import { UserList } from './UserList.js';
import $ from 'jquery';
//import { Thread } from '../classes/Thread.js';
import { Threads } from '../components/Threads.js';
import _ from 'lodash';
import { UserLookup } from '../classes/UserLookup.js';

export class UserLanding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectedThread: null,
    };
  }

	lookup = new UserLookup("http://localhost:8080/secure/users", this.props.token);

	componentWillMount() {
		this.lookup.get('me').then((data) => {
			this.setState({user: data});
		});
	}
  componentDidMount() {
    this.ws = new WebSocket('ws://localhost:8080/');
    this.ws.listeners = [];
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);

    this.ws.listeners.push((message) => {
      if(message.type === 'signon') {
        this.setState({
          user: message.payload
        });
      }
    });
  }

  handleMessage(message) {
    let data = JSON.parse(message.data);
    this.ws.listeners.forEach((listener) => {
      listener(data);
    });
  }


  handleOpen(event) {
    let data = {
      "type": "signon",
      "payload": {
        "name": this.props.token
      }
    }
    this.ws.send(JSON.stringify(data));
    event.preventDefault();
  }

	handleSelectThread(thread) {
		this.setState({
			selectedThread: thread
		});
	}

  render() {
		if(this.state.user) {
	    var convo;
	    if(this.ws && this.state.selectedThread)
				convo = <Conversation ref={(o) => {this.convo = o} } ws={this.ws} thread={this.state.selectedThread} lookup={this.lookup}/>

	    return(
	      <div>
	        <h1>Welcome, {this.state.user.username}</h1>
					<Threads lookup={this.lookup} token={this.props.token} selectThread={this.handleSelectThread.bind(this)}/>
	        {convo}
	      </div>
	    );
		} else {
			return <div></div>
		}
  }
}
