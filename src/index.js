import React from 'react';
import ReactDOM from 'react-dom';
import './stylesheets/index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import runtimeEnv from '@mars/heroku-js-runtime-env';

const env = runtimeEnv();
console.log(env);



ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
