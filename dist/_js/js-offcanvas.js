;(function( w, $ ){
	"use strict";

	var name = "offcanvas",
		componentName = name + "-component",
		utils = w.utils,
		doc = w.document;

	w.componentNamespace = w.componentNamespace || {};

	var Offcanvas = w.componentNamespace.Offcanvas = function( element,options ){
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
			panelClasses = [options.baseClass,utils.classes.isClosed],
			panelAttr = {
				tabindex: "-1",
				"aria-hidden": !this.isOpen
			};

		if ( options.role) {
			panelAttr.role = options.role;
		}
		if(!w.utils.supportTransition){
			panelClasses.push( utils.createModifierClass(options.baseClass, options.supportNoTransitionsClass));
		}
		utils.cssModifiers(options.modifiers,panelClasses,options.baseClass );
		this.$element.attr(panelAttr).addClass( panelClasses.join( " " ) );

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
		this.trapTabKey = new w.componentNamespace.TrapTabKey(this.element);
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
			this.closeBtn = new w.componentNamespace.Button(this.$closeBtn[0]);
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
			if( !this.$trigger ){
				this.$trigger = this.$element.data( componentName + "-trigger" );
			}
			if( doc.activeElement ){
				this.lastFocus = doc.activeElement;
			}
			this.isOpen = true;
			$('html, body').addClass(this._bodyOpenClasses.join(" "));

			this._addClasses(this.$element,this.isOpen,true);
			this._addClasses(this.$content,this.isOpen,true);
			if (options.modal) {
				this._addClasses(this.$modal,this.isOpen,true);
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
				}
				self.$element.removeClass(utils.createModifierClass(options.baseClass,'opening'));
			} );
			if( this.$trigger ){
				this.$trigger.button._isExpanded(true);
			}
			// callback on open
			if( this.onOpen && typeof this.onOpen === 'function' ) {
				this.onOpen.call(this.$element);
			}
			this.$element.trigger( "open." + name );
			// close on ESC
			this._trapTabEscKey();
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
		}

		this.$element.attr( "aria-hidden", "true" )
			.addClass(utils.createModifierClass(options.baseClass,'closing'))
			.trigger( "closing." + name );

		this.trapTabKey.unbindTrap();

		if( self.$trigger ){
			self.$trigger.button._isExpanded(false);
		}
		utils.onEndTransition ( this.transitionElement, function() {

			self._addClasses(self.$element,self.isOpen,false);
			self._addClasses(self.$content,self.isOpen,false);

			if (self.options.modal) {
				self._addClasses(self.$modal,self.isOpen,false);
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
		function update() {
			ticking = false;
		}
		function requestTick() {
			if(!ticking) {
				utils.raf(update);
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
			offcanvasID = this.$element.attr('id'),
			att = "data-offcanvas-trigger",
			$triggerButton;

		if (!options.triggerButton) {
			$triggerButton = $( "["+ att +"='" + offcanvasID + "']" );
		} else {
			$triggerButton = $(options.triggerButton);
		}
		new w.componentNamespace.OffcanvasTrigger( $triggerButton[0], { "offcanvas": offcanvasID } ).init();
	};

	Offcanvas.prototype.setButton = function(trigger){
		this.$element.data( componentName + "-trigger", trigger );
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
