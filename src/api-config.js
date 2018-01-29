import runtimeEnv from '@mars/heroku-js-runtime-env';

let serverUrl, wsUrl;
const env = runtimeEnv();

console.log(env);

const hostname = window && window.location && window.location.hostname;

if(env.REACT_APP_SERVER_URL && env.REACT_APP_WS_URL) {
	serverUrl = env.REACT_APP_SERVER_URL;
	wsUrl = env.REACT_APP_WS_URL;
} else {
	serverUrl = process.env.REACT_APP_SERVER_URL;
	wsUrl = process.env.REACT_APP_WS_URL;
}

export { serverUrl, wsUrl };
