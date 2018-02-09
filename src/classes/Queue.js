export class Queue {

	constructor(enabled = false) {
		this.enabled = enabled;
		this._queue = [];
	}

	add(fn) {
		this._queue.push(() => {
			fn();
			if(this.enabled) {
				this.next();
			}
		});

		if(this.enabled) {
			this.next();
		}
	}

	start() {
		this.enabled = true;
		this.next();
	}

	next() {
		var shift = this._queue.shift();
		if(shift) {
			shift();
		}
	}
}
