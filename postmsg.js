/**
 * Thanks Daniel Park for concept & solution!
 *
 The MIT License

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 **/

/*jslint browser: true, vars: true*/
/*global jQuery, postmsg */

(function (window, $) {
	'use strict';

	var document = window.document;

	if (!("console" in window)) {
		var c = window.console = {};
		c.log = c.warn = c.error = c.debug = function(){};
	}

	/**
	 * Public methods
	 */
	$.postmsg = $.postmsg || {};

	/**
	 *
	 * @param type
	 * @param fn
	 * @param origin
	 * @returns {*}
	 */
	$.postmsg.bind = function (type, fn, origin) {
		postmsg.bind(type, fn, origin);
	};

	/**
	 *
	 * @param options
	 * @returns {*}
	 */
	$.postmsg.send = function (options) {
		postmsg.send(options);
	};

	/**
	 * Private methods
	 */
	var postmsg = {

		/**
		 * Public methods
		 */

		/**
		 * @method bind
		 * @param type - event name
		 * @param fn - callback function
		 * @param origin - domain origin
		 * @public
		 */
		bind: function (type, fn, origin) {
			if (!!window.postMessage) {
				postmsg._bind();
			} else {
				postmsg._logging('postmessage is not supported on the browser');
				return;
			}

			var l = postmsg.data("listeners.postmessage");
			if (!l) {
				l = {};
				postmsg.data("listeners.postmessage", l);
			}

			var fns = l[type];
			if (!fns) {
				fns = [];
				l[type] = fns;
			}
			fns.push({fn: fn, origin: origin || '*'});
		},

		/**
		 * @method send
		 * @param options - look at $.extend defaults params
		 * @public
		 */
		send: function (options) {
			var o = $.extend({}, postmsg.defaults, options);

			if (!o.target) {
				postmsg._logging("postmessage target window required");
				return;
			}
			if (!o.type) {
				postmsg._logging("postmessage type required");
				return;
			}
			if (!o.data) {
				o.data = {};
			}
			var strmsg,
				msg = {data: o.data, type: o.type},
				frameElement = document.getElementById(o.target);

			try {
				strmsg = postmsg._serialize(msg);
			} catch (err) {
				throw err;
			}
			if (!!window.postMessage && frameElement !== null) {
				frameElement.contentWindow.postMessage(strmsg, o.origin || '*');
			} else {
				postmsg._logging("postmessage cannot be send");
			}
		},

		/**
		 * Storing this data about binding
		 * @param k
		 * @param v
		 * @returns {*}
		 */
		data: function (k, v) {
			if (v === undefined) {
				return postmsg._data[k];
			}
			postmsg._data[k] = v;
			return v;
		},

		/**
		 * Private methods
		 */
		_data: {},

		/**
		 * Add message listener for window
		 * @method _bind
		 * @private
		 */
		_bind: function () {
			// are we already listening PostMessage on this ?
			if (!postmsg.data("listening.postmessage")) {
				if (window.addEventListener) {
					window.addEventListener("message", postmsg._dispatch, false);
				}
				postmsg.data("listening.postmessage", 1);
			}
		},

		/**
		 * Dispatch event & stringify event data
		 * @method _dispatch
		 * @param e
		 * @private
		 */
		_dispatch: function (e) {
			var msg;
			try {
				msg = postmsg._unserialize(e.data);
			} catch (err) {
				postmsg._logging("postmessage data invalid json: ", err);
				return;
			}

			if (!msg.type) {
				postmsg._logging("postmessage message type required");
				return;
			}

			// dispatch 'bind' callback
			var l = postmsg.data("listeners.postmessage") || {},
				fns = l[msg.type] || [],
				i = 0,
				len = fns.length;

			for (i; i < len; i++) {
				var o = fns[i];
				try {
					o.fn(msg, e);
				} catch (exep) {
					throw exep;
				}
			}
		},

		/**
		 * @method _unserialize
		 * @param string
		 * @returns {*}
		 * @private
		 */
		_unserialize: function (string) {
			return JSON.parse(string);
		},

		/**
		 * @method _serialize
		 * @param obj
		 * @returns {*}
		 * @private
		 */
		_serialize: function (obj) {
			return JSON.stringify(obj);
		},

		/**
		 * @method _logging
		 * @param message
		 * @private
		 */
		_logging: function (message) {
			console.warn(message);
		}
	};

	$.extend(postmsg, {
		defaults: {
			target: null,  /* target window (required) */
			type: null,    /* message type (required) */
			data: null,    /* message data (required) */
			origin: "*"   /* postmessage origin (optional) */
		}
	});

})(window, jQuery);