const settings = require('api-config.js');

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/')
  ;
	const rawData = window.atob(base64);
	return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function registerServiceWorker() {
	if(!('serviceWorker' in navigator)) {
		return new Promise((res, rej)=> {
			rej('Not supported!');
		});
	}

	return navigator.serviceWorker.register('/notificationsSW.js')
		.then(function(registration) {
			console.log('Service worker successfully registered.');
			return registration;
		})
		.catch(function(err) {
			console.error('Unable to register service worker.', err);
		});
}

export function askPermission() {
	return new Promise(function(resolve, reject) {
		const permissionResult = Notification.requestPermission(function(result) {
			resolve(result);
		});

		if (permissionResult) {
			permissionResult.then(resolve, reject);
		}
	})
		.then(function(permissionResult) {
			if (permissionResult !== 'granted') {
				return false;
			} else {
				return true;
			}
		});
}

export function subscribeUserToPush() {
	return navigator.serviceWorker.register('/notificationsSW.js')
		.then(function(registration) {
			const subscribeOptions = {
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(
					'BMBsv2GwHcDxMrcdNY_6YarazWs4tWWwDFtUXuNBHL7iPPWtFZx6-8eO34lcR1nQVcMpL_GlHr1xtDp49knVqiI'
				)
			};

			return registration.pushManager.subscribe(subscribeOptions);
		})
		.then(function(pushSubscription) {
			console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
			return pushSubscription;
		});
}

export function unregister() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then(registration => {
			registration.unregister();
		});
	}
}

export function doSetup(token, onClick) {
	console.log('Platform: web; Using WebPush.');
	let notifySetting = localStorage.getItem('notifications');
	if(notifySetting === 'true') {
		registerServiceWorker().then(() => {
			askPermission().then((granted) => {
				if(!granted) {
					localStorage.setItem('notifications', 'never');
				} else {
					localStorage.setItem('notifications', true);
					subscribeUserToPush().then((subscription) => {
						navigator.serviceWorker.addEventListener('message', (event) => {
							if(event.data.type == 'notificationClicked') {
								onClick(event);
							}
						});

						let postData = {
							type: 'webpush',
							data: subscription
						};
						return fetch(
							settings.serverUrl + '/secure/subscribe',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'Authorization': 'Bearer ' + token
								},
								body: JSON.stringify(postData)
							}).then(function(response) {
							if (!response.ok) {
								throw new Error('Bad status code from server.');
							}
							return response.json();
						}).then(function(responseData) {
							if (!(responseData && responseData.success)) {
								throw new Error('Bad response from server.');
							}
						});
					});
				}

			});
		});
	}
}
