let serverUrl, wsUrl;

const hostname = window && window.location && window.location.hostname;

if(hostname === 'localhost') {
	serverUrl = 'http://localhost:8080/api';
	wsUrl = 'ws://localhost:8080/api/ws';
} else {
	serverUrl = 'https://peep-chat.herokuapp.com/api';
	wsUrl = 'wss://peep-chat.herokuapp.com/api/ws';
}

module.exports = { serverUrl, wsUrl };
