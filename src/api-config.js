import runtimeEnv from '@mars/heroku-js-runtime-env';

let serverUrl, wsUrl;
const env = runtimeEnv();

console.log(env);

const hostname = window && window.location && window.location.hostname;

if(env.REACT_APP_SERVER_URL && env.REACT_APP_WS_URL) {
	serverUrl = env.SERVER_URL;
	wsUrl = env.WS_URL;
} else {
	serverUrl = 'http://localhost:8080/api';
	wsUrl = 'ws://localhost:8080/api/ws';
}

export { serverUrl, wsUrl };
