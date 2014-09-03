/*
	Guard lets your lock and unlock.
	Nice for using shared resources.
*/
(function() {
	var galaxy = require('galaxy');

	function Guard(locked) {
		var callbacks = [];
		var locked = locked === true ? true : false;

		function lock() {
			locked = true;
		}

		function unlock() {
			locked = false;
			// clone array
			var tmp = callbacks.slice(0);
			// clear callbacks
			callbacks = [];
			for (var i = 0; i < tmp.length; i++) {
				tmp[i]();
			}
		}

		function isLocked() {
			return locked;
		}

		function callback(callback) {
			if (locked) {
				callbacks.push(callback);
			} else {
				callback();
			}
		}

		return {
			lock: lock,
			unlock: unlock,
			isLocked: isLocked,
			callback: callback,
			callbackAsync: galaxy.star(callback)
		};
	}

	if (module.parent) {
		module.exports = Guard;
		return;
	}

	var assert = require('assert');

	galaxy.main(function *() {
		var callbacks = 0;

		var guard = new Guard(false);

		assert(guard.isLocked() == false);

		guard.lock();

		assert(guard.isLocked() == true);

		guard.callback(function() {
			// First lock, so this one has to be executed first.
			assert(callbacks == 0);
			callbacks++;
		});

		setTimeout(function() {
			guard.unlock();
		});

		yield guard.callbackAsync();
		callbacks++;

		assert(callbacks == 2, "Not all callbacks where called");
	});
})();
