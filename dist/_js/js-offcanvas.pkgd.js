;(function( window ){
	"use strict";

	var utils = window.utils || {};

	utils.classes = {
		hiddenVisually: "u-hidden-visually",
		modifier: "--",
		isActive: "is-active",
		isClosed: "is-closed",
		isOpen: "is-open",
		isClicked: "is-clicked",
		isAnimating: "is-animating",
		isVisible: "is-visible",
		hidden: "u-hidden"
	};

	utils.keyCodes = {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	};

	utils.a11yclick = function(event) {
		var code = event.charCode || event.keyCode,
			type = event.type;

		if (type === 'click') {
			return true;
		} else if (type === 'keydown') {
			if (code === utils.keyCodes.SPACE || code === utils.keyCodes.ENTER) {
				return true;
			}
		} else {
			return false;
		}
	};

	utils.a11yclickBind = function(el, callback, name) {
		el.on("click." + name + " keydown." + name,function(event){
			if ( utils.a11yclick(event)) {
				event.preventDefault(event);
				if( callback && typeof callback === 'function' ) { callback.call(); }
				el.trigger('clicked.'+name);
			}
		});
	};

	utils.supportTransition = ('transition' in document.documentElement.style) || ('WebkitTransition' in document.documentElement.style);

	utils.whichTransitionEvent = function () {
		var el = document.createElement('fakeelement'),
			transitions = {
				'transition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			};

		for (var t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	};

	utils.transEndEventName = utils.whichTransitionEvent();

	utils.onEndTransition = function( el, callback ) {
		var onEndCallbackFn = function( ev ) {
			if( utils.supportTransition ) {
				if( ev.target != this ) return;
				this.removeEventListener( utils.transEndEventName, onEndCallbackFn );
			}
			if( callback && typeof callback === 'function' ) { callback.call(); }
		};
		if( utils.supportTransition ) {
			el.addEventListener( utils.transEndEventName, onEndCallbackFn );
		}
		else {
			onEndCallbackFn();
		}
	};

	utils.createModifierClass = function( cl, modifier ){
		return cl + utils.classes.modifier + modifier
	};

	utils.cssModifiers = function( modifiers, cssClasses, baseClass ){
		var arr = modifiers.split(",");
		for(var i=0, l = arr.length; i < l; i++){
			cssClasses.push( utils.createModifierClass(baseClass,arr[i].trim()) );
		}
	};

	utils.getMetaOptions = function( el, name, metadata ){
		var dataAttr = 'data-' + name,
			dataOptionsAttr = dataAttr + '-options',
			attr = el.getAttribute( dataAttr ) || el.getAttribute( dataOptionsAttr );
		try {
			return attr && JSON.parse( attr ) || {};
		} catch ( error ) {
			// log error, do not initialize
			if ( console ) {
				console.error( 'Error parsing ' + dataAttr + ' on ' + el.className + ': ' + error );
			}
			return;
		}
	};

	window.utils = utils;

})(this);


/*
 * TrapTabKey
 * Based on https://github.com/gdkraus/accessible-modal-dialog/blob/master/modal-window.js
 * Copyright (c) 2016 Vasileios Mitsaras.
 * Licensed under MIT
 */

(function( w, $ ){
	"use strict";

	var name = "trab-tab",
		componentName = name + "-component";

	w.componentNamespace = w.componentNamespace || {};

	var TrapTabKey = w.componentNamespace.TrapTabKey = function( element,options ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		// assign element for method events
		this.element = element;
		this.$element = $( element );
		// Options
		options = options || {};
		this.options = $.extend( {}, this.defaults, options );
	};


	TrapTabKey.prototype.init = function(){

		if ( this.$element.data( componentName ) ) {
			return;
		}

		this.$element.data( componentName, this );
	};

	TrapTabKey.prototype.bindTrap = function(){
		var self = this;

		this.$element
			.on( 'keydown.' + name, function( e ){
				self._trapTabKey(self.$element, e );
			} );
	};

	TrapTabKey.prototype.unbindTrap = function(){
		this.$element
			.off( 'keydown.' + name);
	};

	TrapTabKey.prototype.giveFocus = function(){
		var self = this,
			opts = self.options;

		// get list of all children elements in given object
		var o = self.$element.find('*'),
			focusEl = self.$element.find('[data-focus]');

		// set the focus to the first keyboard focusable item
		focusEl.length ? focusEl.first().focus() : o.filter(opts.focusableElementsString).filter(':visible').first().focus();

	};


	TrapTabKey.prototype._trapTabKey = function(obj, evt){
		var self = this,
			opts = self.options;

		// if tab or shift-tab pressed
		if (evt.which == 9) {

			// get list of all children elements in given object
			var o = obj.find('*');

			// get list of focusable items
			var focusableItems;
			focusableItems = o.filter(opts.focusableElementsString).filter(':visible');

			// get currently focused item
			var focusedItem;
			focusedItem = jQuery(':focus');

			// get the number of focusable items
			var numberOfFocusableItems;
			numberOfFocusableItems = focusableItems.length;

			// get the index of the currently focused item
			var focusedItemIndex;
			focusedItemIndex = focusableItems.index(focusedItem);

			if (evt.shiftKey) {
				//back tab
				// if focused on first item and user preses back-tab, go to the last focusable item
				if (focusedItemIndex == 0) {
					focusableItems.get(numberOfFocusableItems - 1).focus();
					evt.preventDefault();
				}

			} else {
				//forward tab
				// if focused on the last item and user preses tab, go to the first focusable item
				if (focusedItemIndex == numberOfFocusableItems - 1) {
					focusableItems.get(0).focus();
					evt.preventDefault();
				}
			}
		}

	};

	TrapTabKey.prototype.defaults = {
		focusableElementsString : "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]"
	};

	TrapTabKey.defaults = TrapTabKey.prototype.defaults;

})(this, jQuery);

(function( window, $ ){
	"use strict";
	var name = "button",
		componentName = name + "-component",
		utils = window.utils,
		cl = {
			iconOnly: "icon-only",
			withIcon: "icon",
			toggleState: "toggle-state",
			showHide: "visible-on-active"
		};

	window.componentNamespace = window.componentNamespace || {};

	var Button = window.componentNamespace.Button = function( element, options ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		// assign element for method events
		this.element = element;
		this.$element = $( element );
		// Options
		this.options = options = options || {};
		this.metadata = utils.getMetaOptions( this.element, name );
		this.options = $.extend( {}, this.defaults, this.metadata, options );
	};

	Button.prototype.init = function(){

		if ( this.$element.data( componentName ) ) {
			return;
		}

		this.$element.data( componentName, this );
		this.hasTitle = !!this.$element.attr( "title" );
		this.$element.trigger( "beforecreate." + name );
		this.isPressed = false;
		this.isExpanded = false;
		this._create();

	};

	Button.prototype._create = function(){
		var options = this.options,
			buttonTextClasses = [options.baseClass + '__text'];

		this._buttonClasses = [options.baseClass];
		if ( options.label === null ) {
			options.label = this.$element.html();
		}

		if ( options.wrapText ) {
			this.$buttonText = $( '<span></span>' ).html( options.label ).appendTo(this.$element.empty());
		}

		if ( options.icon ) {

			this.$buttonIcon = $( "<span class='"+ options.iconFamily +' ' + utils.createModifierClass(options.iconFamily, options.icon)+"'></span>" ).prependTo(this.$element);
			this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.withIcon) );

			if ( options.iconActive ) {
				options.toggle = true;
				this.$buttonIconActive = $( "<span class='"+ options.iconFamily  + ' ' + utils.createModifierClass(options.iconFamily, options.iconActive)+ ' ' +utils.createModifierClass(options.iconFamily, cl.showHide)+ "'></span>" ).insertAfter(this.$buttonIcon);
				this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.toggleState) );
			}
			if ( options.hideText ) {
				buttonTextClasses.push(utils.classes.hiddenVisually );
				this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.iconOnly) );
			}
		}

		if ( options.modifiers ) {
			utils.cssModifiers(options.modifiers,this._buttonClasses,options.baseClass);
		}
		if ( options.wrapText ) {
			this.$buttonText.addClass( buttonTextClasses.join( " " ) );
		}

		if ( options.textActive && options.wrapText ) {
			options.toggle = true;
			buttonTextClasses.push( utils.createModifierClass(options.baseClass+'__text',cl.showHide) );
			this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.toggleState) );

			this.$buttonTextActive = $( '<span></span>' )
				.addClass( buttonTextClasses.join( " " ) )
				.html( options.textActive )
				.insertAfter(this.$buttonText);
			this.$element.attr('aria-live','polite');
		}

		this.$element.addClass( this._buttonClasses.join( " " ) );

		if ( options.role) {
			this.$element.attr( "role", options.role );
		}
		if ( options.controls ) {
			this.controls(options.controls);
		}
		if ( options.pressed ) {
			this._isPressed(options.pressed);
		}
		if ( options.expanded ) {
			this.isPressed = true;
			this._isExpanded(options.expanded);
		}
		if ( !this.hasTitle && options.hideText && !options.hideTitle ) {
			this.$element.attr('title',this.$element.text());
		}
		this.$element.trigger( "create." + name );
	};

	Button.prototype._isPressed = function(state){
		this.isPressed = state;
		this.$element.attr( "aria-pressed", state )[ state ? "addClass" : "removeClass" ](utils.classes.isActive);
	};

	Button.prototype._isExpanded = function(state){
		this.isExpanded = state;
		this.$element.attr( "aria-expanded", state )[ state ? "addClass" : "removeClass" ](utils.classes.isActive);
	};

	Button.prototype.controls = function(el){
		this.$element.attr( "aria-controls", el );
	};

	Button.prototype.destroy = function(){
		var options = this.options;

		this.$element
			.removeData(componentName)
			.removeAttr('role')
			.removeAttr('aria-pressed')
			.removeAttr('aria-expanded')
			.removeAttr('aria-controls')
			.removeClass( this._buttonClasses.join( " " ) )
			.removeClass( utils.classes.isActive)
			.off("."+name);
		if ( this.options.icon ) {
			this.$element.find('[class^="'+this.options.iconFamily+'"]').remove();
		}

		if ( options.wrapText ) {
			var btnHtml = this.$buttonText.html();
			this.$element.empty().html(btnHtml);
		}

		this.element = null;
		this.$element = null;
	};

	Button.prototype.defaults = {
		baseClass:"c-button",
		role: "button",
		label: null,
		modifiers: null,
		controls: null,
		textActive: null,
		wrapText: true,
		hideText: false,
		hideTitle: false,
		icon: null,
		iconActive: null,
		iconFamily: "o-icon",
		iconPosition: null,
		pressed: false,
		expanded: false
	};

	Button.defaults = Button.prototype.defaults;

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var pluginName = "jsButton",
		initSelector = ".js-button";

	$.fn[ pluginName ] = function(){
		return this.each( function(){
			new window.componentNamespace.Button( this ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( $( e.target ).is( initSelector ) && e.target ).add( initSelector, e.target ).filter( initSelector )[ pluginName ]();
	});
})(this, jQuery);

;(function( window, $ ){
	"use strict";

	var name = "offcanvas",
		componentName = name + "-component",
		utils = window.utils,
		doc = document;

	window.componentNamespace = window.componentNamespace || {};

	var Offcanvas = window.componentNamespace.Offcanvas = function( element,options ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		// assign element for method events
		this.element = element;
		this.$element = $( element );
		// Options
		this.options = options = options || {};
		this.metadata = utils.getMetaOptions( this.element, name );
		this.options = $.extend( {}, this.defaults, this.metadata, options );
		this.isOpen = false;
		this.onOpen = this.options.onOpen;
		this.onClose = this.options.onClose;
		this.onInit = this.options.onInit;
	};

	Offcanvas.prototype.init = function(){
		if ( this.$element.data( componentName ) ) {
			return;
		}
		this.$element.data( componentName, this );
		this.$element.trigger( "beforecreate." + name );
		this._addAttributes();
		this._initTrigger();
		this._createModal();
		this._trapTabKey();
		this._closeButton();
		if( this.onInit && typeof this.onInit === 'function' ) {
			this.onInit.call(this.element);
		}
		this.$element.trigger( "create." + name );
	};

	Offcanvas.prototype._addAttributes = function(){
		var options = this.options,
			panelAttr = {
				tabindex: "-1",
				"aria-hidden": !this.isOpen
			};

		if ( options.role) {
			panelAttr.role = options.role;
		}
		this._panelClasses = [options.baseClass,utils.classes.isClosed];

		if(!window.utils.supportTransition){
			this._panelClasses.push( utils.createModifierClass(options.baseClass, options.supportNoTransitionsClass));
		}
		utils.cssModifiers(options.modifiers,this._panelClasses,options.baseClass );
		this.$element.attr(panelAttr).addClass( this._panelClasses.join( " " ) );

		// Content-wrap
		this.$content = $('.' + options.contentClass);
		this._contentOpenClasses = [];
		utils.cssModifiers(options.modifiers,this._contentOpenClasses,options.contentClass );

		// Modal
		this._modalOpenClasses = [options.modalClass,utils.classes.isClosed ];
		utils.cssModifiers(options.modifiers,this._modalOpenClasses,options.modalClass );

		// body
		this._bodyOpenClasses = [options.bodyModifierClass+"--visible"];
		utils.cssModifiers(options.modifiers,this._bodyOpenClasses,options.bodyModifierClass);

		if (options.modifiers.toLowerCase().indexOf("reveal") >= 0) {
			this.transitionElement =  this.$content[0];
		} else {
			this.transitionElement = this.element ;
		}
	};

	Offcanvas.prototype._createModal= function() {
		var self = this,
			target = self.$element.parent();
		if (this.options.modal) {
			this.$modal = $( "<div></div>" )
				.on( "mousedown."+name, function() {
					self.close();
				})
				.appendTo( target );
			this.$modal.addClass( this._modalOpenClasses.join( " " ) );
		}
	};

	Offcanvas.prototype._trapTabKey = function() {
		this.trapTabKey = new window.componentNamespace.TrapTabKey(this.element);
		this.trapTabKey.init();
	};

	Offcanvas.prototype._trapTabEscKey = function() {
		var self = this;
		// close on ESC
		$( doc ).on( "keyup." + name, function(ev){
			var keyCode = ev.keyCode || ev.which;
			if( keyCode === utils.keyCodes.ESCAPE && self.isOpen ) {
				if ($("input").is(":focus")) {
					return;
				}
				self.close();
			}
		} );
	};

	Offcanvas.prototype._closeButton = function() {
		var self = this,
			options = self.options;
		function closeOffcanvas(){
			self.close();
		}
		this.$closeBtn = this.$element.find('.'+options.closeButtonClass);
		if( this.$closeBtn.length ){
			this.closeBtn = new window.componentNamespace.Button(this.$closeBtn[0]);
			this.closeBtn.init();
			this.closeBtn.controls(this.$element.attr('id'));
			utils.a11yclickBind(this.$closeBtn,closeOffcanvas,name);
		}
	};

	Offcanvas.prototype.open = function(){
		var self = this,
			options = self.options;
		if (!this.isOpen) {
			if (options.resize) {
				this.resize();
			}
			if( doc.activeElement ){
				this.lastFocus = doc.activeElement;
				this.lastFocusTrigger = $(this.lastFocus).data( "button-component");
			}
			this.isOpen = true;
			$('html, body').addClass(this._bodyOpenClasses.join(" "));

			this._addClasses(this.$element,this.isOpen,true);
			this._addClasses(this.$content,this.isOpen,true);
			if (options.modal) {
				this._addClasses(this.$modal,this.isOpen,true);
				this.$modal.addClass(utils.createModifierClass(options.modalClass,'opening'));
			}

			this.$element.attr( "aria-hidden", "false" )
				.addClass(utils.createModifierClass(options.baseClass,'opening'))
				.trigger( "opening." + name );
			this.$content.addClass( this._contentOpenClasses.join( " " ));

			// Transition End Callback
			utils.onEndTransition ( this.transitionElement, function() {
				self.trapTabKey.giveFocus();
				self.trapTabKey.bindTrap();
				self._addClasses(self.$element,self.isOpen,false);
				self._addClasses(self.$content,self.isOpen,false);
				if (options.modal) {
					self._addClasses(self.$modal,self.isOpen,false);
					self.$modal.removeClass(utils.createModifierClass(options.modalClass,'opening'));
				}
				self.$element.removeClass(utils.createModifierClass(options.baseClass,'opening'));
			} );
			if( this.$trigger ){
				this.$trigger.button._isExpanded(true);
			}
			if(this.lastFocusTrigger) {
				this.lastFocusTrigger._isExpanded(true);
			}
			// callback on open
			if( this.onOpen && typeof this.onOpen === 'function' ) {
				this.onOpen.call(this.$element);
			}
			// close on ESC
			this._trapTabEscKey();
			this.$element.trigger( "open." + name );
		}
	};

	Offcanvas.prototype.close = function(){
		var self = this,
			options = self.options;
		if( !this.isOpen ){
			return;
		}
		this.isOpen = false;

		this._addClasses(this.$element,this.isOpen,true);
		this._addClasses(this.$content,this.isOpen,true);

		if (this.options.modal) {
			this._addClasses(this.$modal,this.isOpen,true);
			this.$modal.addClass(utils.createModifierClass(options.modalClass,'closing'));
		}

		this.$element.attr( "aria-hidden", "true" )
			.addClass(utils.createModifierClass(options.baseClass,'closing'))
			.trigger( "closing." + name );

		this.trapTabKey.unbindTrap();

		if( self.$trigger ){
			self.$trigger.button._isExpanded(false);
		}

		if(this.lastFocusTrigger) {
			this.lastFocusTrigger._isExpanded(false);
			this.lastFocusTrigger = null;
		}

		utils.onEndTransition ( this.transitionElement, function() {

			self._addClasses(self.$element,self.isOpen,false);
			self._addClasses(self.$content,self.isOpen,false);

			if (self.options.modal) {
				self._addClasses(self.$modal,self.isOpen,false);
				self.$modal.removeClass(utils.createModifierClass(options.modalClass,'closing'));
			}

			self.$content.removeClass( self._contentOpenClasses.join( " " ) );
			self.$element.removeClass(utils.createModifierClass(options.baseClass,'closing'));

			$('html, body').removeClass(self._bodyOpenClasses.join(" "));

			if( self.lastFocus ){
				self.lastFocus.focus();
			}
		} );
		// callback onClose
		if( this.onClose && typeof this.onClose === 'function' ) {
			this.onClose.call(this.element);
		}
		this.$element.trigger( "close." + name );
		$( doc ).off( "keyup." + name);
		$(window).off('.'+name);
	};

	Offcanvas.prototype._addClasses = function(el,isOpen,beforeTransition){
		if (isOpen) {
			if (beforeTransition) {
				el
					.removeClass(utils.classes.isClosed)
					.addClass(utils.classes.isAnimating)
					.addClass(utils.classes.isOpen);
			} else {
				el.removeClass(utils.classes.isAnimating);
			}
		} else {
			if (beforeTransition) {
				el
					.removeClass( utils.classes.isOpen  )
					.addClass( utils.classes.isAnimating );
			} else {
				el
					.addClass( utils.classes.isClosed )
					.removeClass( utils.classes.isAnimating );
			}
		}
	};

	Offcanvas.prototype.toggle = function(){
		this[ this.isOpen ? "close" : "open" ]();
	};

	Offcanvas.prototype.resize = function(){
		var self = this,ticking;

		var raf = (function(){
			return  window.requestAnimationFrame   ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
		})();

		function update() {
			ticking = false;
		}
		function requestTick() {
			if(!ticking) {
				raf(update);
			}
			ticking = true;
		}
		function onResize() {
			requestTick();
			self.$element.trigger( "resizing." + name );
			if (self.options.resize) {
				self.close();
			}
		}
		$(window).on('resize.' + name + ' orientationchange.' + name, onResize);
	};

	Offcanvas.prototype._initTrigger = function() {
		var self = this,
			options = self.options,
			offcanvasID = this.$element.attr('id');

		if (options.triggerButton ) {
			this.$triggerBtn = $(options.triggerButton);
			new window.componentNamespace.OffcanvasTrigger(this.$triggerBtn[0], {"offcanvas": offcanvasID}).init();
		}
	};

	Offcanvas.prototype.setButton = function(trigger){
		this.$element.data( componentName + "-trigger", trigger );
	};

	Offcanvas.prototype.destroy = function(){

		this.$element.trigger( "destroy." + name );

		if( this.isOpen ){
			this.close();
		}

			this.$element
			.removeData()
			.removeClass( this._panelClasses.join( " " ) )
			.removeAttr('tabindex')
			.removeAttr('aria-hidden');

		if( this.$triggerBtn ){
			this.$triggerBtn
				.removeData('offcanvas-trigger-component')
				.off(".offcanvas")
				.off(".offcanvas-trigger")
				.data('button-component').destroy();
		}

		this.$element.off( "." + name );
		$( doc ).off( "." + name);
		$(window).off('.'+name);

	};

	Offcanvas.prototype.defaults = {
		role: "dialog",
		modifiers: "left,overlay",
		baseClass: "c-offcanvas",
		modalClass: "c-offcanvas-bg",
		contentClass: "c-offcanvas-content-wrap",
		closeButtonClass: "js-offcanvas-close",
		bodyModifierClass: "has-offcanvas",
		supportNoTransitionsClass: "support-no-transitions",
		resize: false,
		triggerButton: null,
		modal: true,
		onOpen: null,
		onClose: null,
		onInit: null
	};

	Offcanvas.defaults = Offcanvas.prototype.defaults;

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var pluginName = "offcanvas",
		initSelector = ".js-" + pluginName;

	$.fn[ pluginName ] = function(options){
		return this.each( function(){
			new w.componentNamespace.Offcanvas( this, options ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( w.document ).on( "enhance", function(e){
		$( $( e.target ).is( initSelector ) && e.target ).add( initSelector, e.target ).filter( initSelector )[ pluginName ]();
	});

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var name = "offcanvas-trigger",
		componentName = name + "-component",
		utils = w.utils;

	w.componentNamespace = w.componentNamespace || {};

	var OffcanvasTrigger = w.componentNamespace.OffcanvasTrigger = function( element,options ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		// assign element for method events
		this.element = element;
		this.$element = $( element );
		// Options
		this.options = options = options || {};
		this.options = $.extend( {}, this.defaults, options );
	};

	OffcanvasTrigger.prototype.init = function(){

		if ( this.$element.data( componentName ) ) {
			return;
		}
		this.$element.data( componentName, this );
		this._create();
	};

	OffcanvasTrigger.prototype._create = function(){
		this.options.offcanvas = this.options.offcanvas || this.$element.attr( "data-offcanvas-trigger" );
		this.$offcanvas = $( "#" + this.options.offcanvas );
		this.offcanvas = this.$offcanvas.data( "offcanvas-component" );
		if (!this.offcanvas) {
			throw new Error( "Offcanvas Element not found" );
		}
		this.button = new w.componentNamespace.Button(this.element);
		this.button.init();
		this.button.controls(this.options.offcanvas);
		this.button._isExpanded(false);
		this._bindbehavior();
	};

	OffcanvasTrigger.prototype._bindbehavior = function(){
		var self = this;
		this.offcanvas.setButton(self);
		function toggleOffcanvas(){
			self.offcanvas.toggle();
		}
		utils.a11yclickBind(this.$element,toggleOffcanvas,name);
	};

	OffcanvasTrigger.prototype.defaults = {
		offcanvas: null
	};

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var pluginName = "offcanvasTrigger",
		initSelector = "[data-offcanvas-trigger],.js-" + pluginName;

	$.fn[ pluginName ] = function(options){
		return this.each( function(){
			new w.componentNamespace.OffcanvasTrigger( this,options ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( w.document ).on( "enhance", function(e){
		$( $( e.target ).is( initSelector ) && e.target ).add( initSelector, e.target ).filter( initSelector )[ pluginName ]();
	});

})(this, jQuery);
