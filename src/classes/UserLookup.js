import $ from 'jquery';

export class UserLookup {
	constructor(userUri, token) {
		this.uri = userUri;
		this.token = token;
		this.store = {};
	}

	get(id) {
		let p = new Promise((res, rej) => {
			if(this.store[id]) {
				res(this.store[id]);
			} else {
				$.ajax({
					url: this.uri + '/' + id,
					headers: {'Authorization': 'Bearer ' + this.token},
					success: (data) => {
						this.store.id = data;
						res(data);
					},
					error: (err, text) => {
						rej(err, text);
					}
				});
			}
		});
		return p;
	}
}
