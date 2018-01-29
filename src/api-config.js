let serverUrl, wsUrl;

let env;

const hostname = window && window.location && window.location.hostname;

if(env.SERVER_URL && env.WS_URL) {
	serverUrl = env.SERVER_URL;
	wsUrl = env.WS_URL;
} else {
	serverUrl = 'http://localhost:8080/api';
	wsUrl = 'ws://localhost:8080/api/ws';
}

export { serverUrl, wsUrl };
