/*global module:true*/
/*global test:true*/
/*global equal:true*/
/*global jQuery:true*/
/*global ok:true*/
/*global console:true*/
(function(w, $ ) {
	"use strict";

	module( "Constructor", {
		setup: function() {
			$( "#qunit-fixture" ).trigger( "enhance" );
			this.offcanvas = $( "#offcanvas" ).data( "offcanvas-component" );
		},
		teardown: function() {
			this.offcanvas = null;
		}
	});

	test( "Initialization", function() {
		ok( $( "#offcanvas" ).is( ".c-offcanvas" ), "Has individual initialization class." );
		console.log( 'modifier classes: '+this.offcanvas.element.className );
		ok( $( "#offcanvas" ).not( ":hidden" ).length, "Offcanvas is hidden by default." );
	});

	test( "Aria", function() {
		ok( $( "#offcanvas" ).is( "[tabindex='-1']" ), "Tabindex added." );
		ok( $( "#offcanvas" ).is( "[role=dialog]" ), "Role added." );
		ok( $( "#offcanvas" ).is( "[id]" ), "offcanvas has an ID." );
		ok( $( "#offcanvas" ).is( "[aria-hidden]" ), "aria-hidden attribute added." );
		ok( $( "#offcanvas-trigger" ).is( "[aria-controls]" ), "Btn aria-controls added." );
		ok( $( "#offcanvas-trigger" ).is( "[aria-pressed]" ), "Btn aria-pressed added." );
		ok( $( "#offcanvas-trigger" ).is( "[aria-expanded]" ), "Btn aria-expanded added." );
		ok( $( "#offcanvas-trigger" ).is( "[role='button']" ), "Btn has button role." );
		equal( $( "#offcanvas-trigger" ).attr( "aria-controls" ), $( "#offcanvas" ).attr( "id" ), "aria-controls value matches offcanvas ID." );
	});

	test( "States", function() {
		this.offcanvas.open();
		ok( this.offcanvas.$element.is( ".is-open" ), "Has is-open class." );
		ok( this.offcanvas.$element.is( "[aria-hidden='false']" ), "aria-hidden set to false." );
		ok( this.offcanvas.$trigger.$element.is( ".is-active" ), "Button has is-active class." );
		ok( this.offcanvas.$trigger.$element.is( "[aria-expanded='true']" ), "Button aria-expanded set to true" );
		this.offcanvas.close();
		ok( this.offcanvas.$element.is( ".is-closed" ), "Has is-closed class." );
		ok( this.offcanvas.$element.is( "[aria-hidden='true']" ), "aria-hidden set to true." );
		ok( this.offcanvas.$trigger.$element.is( "[aria-expanded='false']" ), "Button aria-expanded set to false." );

	});

})( window, jQuery );