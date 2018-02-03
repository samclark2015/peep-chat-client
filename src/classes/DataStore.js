import $ from 'jquery';
import _ from 'lodash';

export class DataStore {
	constructor(url, token) {
		this._changeListeners = [];
		this.data = [];
		this.url = url;
		this.token = token;

		this.loadData();
	}

	loadData() {
		return $.ajax({
			url: this.url,
			headers: {'Authorization': 'Bearer ' + this.token},
		})
			.then((data) => {
				this.data = data;
				this.notifyListeners();
				return data;
			});
	}
	addEventListener(fn) {
		this._changeListeners.push(fn);
		fn();
	}
	removeEventListener(fn) {
		_.remove(this._changeListeners, (o) => o === fn);
	}
	notifyListeners() {
		this._changeListeners.forEach((listener) => {
			listener();
		});
	}
}
