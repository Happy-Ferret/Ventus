
define(function(require) {

	require('css!../../css/window.less');

	var WindowView = require("tmpl!../tmpl/window.tmpl");

	var Emitter = require('core/emitter');
	var View = require('core/view');


	var Window = function (options) {
		var self = this;

		this.signals = new Emitter();

		// View
		this.el = WindowView({
			title: "Window"
		});
		this.el.listen(this.events.window, this); 

		this.width = 400;
		this.height = 200;
		this.z = 10000;

		// Open animation
		this.el.start('opening');

		this.enabled = true;
		this.active = false;
		this.closed = false;
		this.maximized = false;
	};

	Window.prototype = {
		_restore: null,
		_moving: null,
		_resizing: null,

		events: {
			window: {
				'mousedown': function(e) {
					this.enabled && this.focus();
				},

				'header mousedown': function(e) {
					if(!this.enabled) return;

					this._moving = this.toLocal({
						x: e.clientX,
						y: e.clientY
					});

					this.el.addClass('move');
				},

				'header dblclick': function(e) {
					this.enabled && this.maximize();
				},

				'header button.wm-close click': function(e) {
					e.stopPropagation();
					e.preventDefault();

					this.enabled && this.close();
				},

				'header button.wm-maximize click': function(e) {
					e.stopPropagation();
					e.preventDefault();

					this.enabled && this.maximize();
				},

				'header button.wm-minimize click': function(e) {
					e.stopPropagation();
					e.preventDefault();

					this.enabled && this.minimize();
				},

				'header button mousedown': function(e) {
					e.stopPropagation();
					e.preventDefault();
				},

				'button.wm-resize mousedown': function(e) {
					if(!this.enabled) return;

					this._resizing = {
						width: this.width - e.clientX,
						height: this.height - e.clientY
					};
				}
			},

			space: {
				'mousemove': function(e) {
					this._moving && this.move(
						e.clientX - this._moving.x,
						e.clientY - this._moving.y
					);
					
					this._resizing && this.resize(
						e.clientX + this._resizing.width,
						e.clientY + this._resizing.height 
					);
				},

				'mouseup': function(e) {
					if (this._moving) {
						this.el.removeClass('move');
						this._moving = null;
					}

					if (this._resizing) {
						this._restore = null;
						this._resizing = null;
					}
				}
			}
		},

		set space(el) {
			if(el && !el.listen) {
				console.error("The given space element is not a valid View");
				return;
			}

			el.append(this.el);
			el.listen(this.events.space, this);
		},

		get maximized() {
			return this._maximized;
		},

		set maximized(value) {
			if(value) {
				this.stamp();
				this.el.addClass('maximized');

				this.signals.emit('maximize', this);
			} 
			else {
				var self = this;
				this.signals.emit('restore', this);
				self.el.removeClass('maximized');			
			}

			this._maximized = value;
		},

		set active(value) {
			if(value) {
				this.signals.emit('focus', this);
				this.el.addClass('active');
			} 
			else {
				this.signals.emit('blur', this);
				this.el.removeClass('active');
			}

			this._active = value;
		},

		get active() {
			return this._active;
		},

		set enabled(value) {
			if(!value) {
				this.el.addClass('disabled');
			} 
			else {
				this.el.removeClass('disabled');
			}

			this._enabled = value;
		},

		get enabled() {
			return this._enabled;
		},

		set closed (value) {
			var self = this;
			if(value) {
				this.signals.emit('close', this);

				this.el.start('closing', function() {
					this.el.addClass('closed');
				}, this);
				
				//this.detachContent(); @todo implement this function and attachContent();
			}

			this._closed = value;
		},

		get closed() {
			return this._closed;
		},

		set width(value) {
			this.el.width(value);
		},

		get width() {
			return parseInt(this.el.width());
		},

		set height(value) {
			this.el.height(value);
		},
		
		get height() {
			return parseInt(this.el.height());
		},

		set x(value) {
			this.el.css('left', value);
		},

		set y(value) {
			this.el.css('top', value);
		},

		get x() {
			return parseInt(this.el.css('left'));
		},

		get y() {
			return parseInt(this.el.css('top'));
		},

		set z(value) {
			this.el.css('z-index', value);
		},

		get z() {
			return parseInt(this.el.css('z-index'));
		},

		resize: function(w, h) {
			this.width = w;
			this.height = h;
			return this;
		},

		move: function(x, y) {
			this.x = x;
			this.y = y;
			return this;
		},

		/**
		 * @return A function that restores this window
		 */
		stamp: function() {
			this.restore = (function() {
				var size = {
					width: this.width,
					height: this.height
				};

				var pos = {
					x: this.x,
					y: this.y
				};

				return function() {
					this.resize(size.width, size.height);
					this.move(pos.x, pos.y);
				}
			}).apply(this);
		},

		restore: function(){},

		maximize: function() {
			this.maximized = !this.maximized;
		},

		minimize: function() {
			this.signals.emit('minimize', this);
		},

		close: function() {
			this.closed = true;
		},

		focus: function() {
			this.active = true;
		},

		blur: function() {
			this.active = false;
		},

		drop: function() {
			this.el.removeClass('move');
		},

		toLocal: function(coord) {
			return {
				x: coord.x - this.x,
				y: coord.y - this.y
			};
		},

		toGlobal: function(coord) {
			return {
				x: coord.x + this.x,
				y: coord.y + this.y
			};
		}
	}

	return Window;
});
