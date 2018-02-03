import React, { Component } from 'react';
import 'stylesheets/Camera.css';

export class Camera extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selfie: true
		};
	}

	componentDidMount() {
		let cameraProps = {
			audio: false,
			video: {
				width: window.innerWidth,
				height: window.innerHeight,
				facing: this.state.selfie ? 'user' : 'environment'
			}
		};

		var errorCallback = (e) => {
			this.props.onError(e);
		};

		// Not showing vendor prefixes.
		navigator.getUserMedia(cameraProps, (localMediaStream) => {
			this.stream = localMediaStream;
			var video = document.querySelector('video');
			video.src = window.URL.createObjectURL(localMediaStream);

			// Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
			// See crbug.com/110938.
			video.onloadedmetadata = (e) => {
				// Ready to go. Do some stuff.
			};
		}, errorCallback);
	}

	componentWillUnmount() {
		if(this.stream)
			this.stream.getVideoTracks()[0].stop();
	}

	flipCamera() {
		this.setState({selfie: !this.state.selfie});
	}

	render() {
		return (
			<div className="cameraContainer">
				<button className="cameraCloseButton" onClick={this.props.onClose}>Close</button>
				<video autoPlay className="cameraVideo"></video>
			</div>
		);
	}
}
