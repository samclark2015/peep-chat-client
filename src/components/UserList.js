import React, { Component } from 'react';
import $ from 'jquery';

export class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    }
  }

  componentDidMount() {
    $.get('http://localhost:8080/users', null, (data) => {
        this.setState({users: data});
    });
  }

  render() {
    console.log(this.state.users);
    let listItems = this.state.users.map((user, idx) =>
      <li key={idx}>{user.name}</li>
    );

    return (
      <div>
        <ul>
          {listItems}
        </ul>
        <p>Refresh</p>
      </div>
    )
  }
}
