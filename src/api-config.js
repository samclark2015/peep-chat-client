let serverUrl, wsUrl;

const hostname = window && window.location && window.location.hostname;

if(hostname === 'peep-chat.herokuapp.com') {
	serverUrl = 'https://peep-chat.herokuapp.com/api';
	wsUrl = 'wss://peep-chat.herokuapp.com/api/ws';

} else {
	serverUrl = 'http://localhost:8080/api';
	wsUrl = 'ws://localhost:8080/api/ws';
}

module.exports = { serverUrl, wsUrl };
