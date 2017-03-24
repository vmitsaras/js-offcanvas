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
