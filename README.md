# js-offcanvas 

jQuery accessible Offcanvas plugin, using ARIA

[View Demo](http://offcanvas.vasilis.co) 

## Why it is accessible

- It relies on <a href="https://www.w3.org/TR/wai-aria-practices/#dialog_modal"><abbr title="Accessible Rich Internet Application">ARIA</abbr> Design pattern for Dialogs</a>
- The tab key loops through all of the keyboard focusable items within the offcanvas
- You can close it using <kbd>Esc</kbd>.

##Features

- Uses CSS transforms & transitions.
- BEM <kbd>c-offcanvas c-offcanvas--left is-open</kbd>
- From Any Direction: left, right, top and bottom.
- Overlay, Reveal and Push.
- API & Events
- Package managers Bower & NPM

***
######Table of Contents


1. [Getting Started](#getting-started)  
    * [CDN](#cdn) 
    * [HTML](#html)
    * [JS](#js)
    * [Initialize with Vanilla JavaScript](#initialize-with-vanilla-javaScript)
    * [Initialize with jQuery](#initialize-with-vanilla-jquery)
    * [Initialize with HTML](#initialize-with-vanilla-html)
    * [Enhance](#enhance)
2. [Options](#options)
     * [API](#api)
     * [Methods](#methods)
     * [Callbacks](#callbacks)
     * [Events](#events)
3. [Examples](#examples)
4. [Package Managers](#package-managers)
5. [Dependencies](#dependencies)
  
---

## Getting Started
#####CDN
Include the Offcanvas `.css` and `.js` files in your site. Link directly to Offcanvas files on [npmcdn](https://npmcdn.com/).
```html
<script src="https://npmcdn.com/js-offcanvas@1.0/dist/_js/js-offcanvas.pkgd.min.js"></script>
<link rel="stylesheet" href="https://npmcdn.com/js-offcanvas@1.0/dist/_css/minified/js-offcanvas.css">
```

#####HTML
Offcanvas works on a container element with no styles applied. 
```html
<body>
    <div class="c-offcanvas-content-wrap">
        ...
        <a href="#off-canvas" data-offcanvas-trigger="off-canvas">Menu</a>
        ...
    </div>
    <aside id="off-canvas"></aside>
</body>

```
#####JS
```js
$( function(){
    $(document).trigger("enhance");
});
```

#### Initialize with Vanilla JavaScript
```js
$('#off-canvas').offcanvas({
// options
});
```
#### Initialize with jQuery
```js
var elem = document.getElementById('#off-canvas');
var offcanvas = new w.componentNamespace.Offcanvas( elem, {
    // options
    modifiers: 'left,overlay'
});

offcanvas.init();
```
#### Initialize with HTML     

```html
<a class="js-offcanvas-trigger" data-offcanvas-trigger="off-canvas" href="#off-canvas">Menu</a>
<aside class="js-offcanvas" data-offcanvas-options='{ "modifiers": "left,overlay" }' id="off-canvas"></aside>
```
#####Enhance
Typically the enhancement is triggered on DOM ready.
```js
$( function(){
    $(document).trigger("enhance");
});
```
#Options
Set instance options by passing a valid object at initialization, or to the public defaults method. Custom options for a specific instance can also be set by attaching a data-offcanvas-options attribute to the target elment.
This attribute should contain the properly formatted JSON object representing the custom options.
```html
 data-offcanvas-options='{ "modifiers": "left,overlay",... }'
```
| Name        |Default             |Type|
| --- |---|---|
| **modifiers**      | "left,overlay" |string|
| **baseClass**      | "c-offcanvas"      |string|
| **modalClass**      | "c-offcanvas-bg"      |string|
| **contentClass**      | "c-offcanvas-content-wrap"      |string|
| **closeButtonClass**      | "js-offcanvas-close"      |string|
| **role**      | "dialog"      |string|
| **bodyModifierClass**      | "has-offcanvas"      |string|
| **supportNoTransitionsClass**      | "support-no-transitions"      |string|
| **resize**      | true      |boolean|
| **target**      | null      |string|
| **onInit**      | null      |function|
| **onOpen**      | null      |function|
| **onClose**      | null      |function|

##API
The offcanvas API offers a couple of methods to control the offcanvas and are publicly available to all active instances.

```js
var dataOffcanvas = $('#off-canvas').data('offcanvas-component');
```
##Methods
####`open`
```js
dataOffcanvas.open();
```
####`close`
```js
dataOffcanvas.close();
```
####`toggle`
```js
dataOffcanvas.toggle();
```
###Callbacks
####`onInit`
Fires an event when offcanvas is initialized.
```js
dataOffcanvas.onInit = function() {
    console.log(this);
};
```
####`onOpen`
Fires an event when offcanvas is opened.
```js
dataOffcanvas.onOpen = function() {
    console.log('Callback onOpen');
};
```
####`onClose `
Fires an event when offcanvas is closed.
```js
dataOffcanvas.onClose  = function() {
    console.log(this);
};
```
##Events
jQuery.offcanvas fires several events. Simply listen for them with the jQuery.on function. All events are namespaced with offcanvas.

####`beforecreate `
Fires an event before the offcanvas is initialized.
```js
$( document ).on( "beforecreate.offcanvas", function( e ){
	var dataOffcanvas = $( e.target ).data('offcanvas-component');
	console.log(dataOffcanvas);
	dataOffcanvas.onInit =  function() {
		console.log(this);
	};
} );
```
####`create `
Fired once the Plugin is initialized.
```js
$( document ).on( "create.offcanvas", function( e ){ } );
```
####`open `
Fired when the `open` method is called.
```js
$( document ).on( "open.offcanvas", function( e ){ } );
```
####`close `
Fired when the `close` method is called.
```js
$( document ).on( "close.offcanvas", function( e ){ } );
```
####`resizing `
Fired when the window is resized.
```js
$( document ).on( "resizing.offcanvas", function( e ){ } );
```
####`clicked `
Fired when the trigger-btn is clicked.
```js
$( document ).on( "clicked.offcanvas-trigger", function( e ){
    var dataBtnText = $( e.target ).text();
    console.log(e.type + '.' + e.namespace + ': ' + dataBtnText);
} );
```

##Examples
####Left
*With HTML*
```html
<button data-offcanvas-trigger="off-canvas-left">Left</button>
<aside id="off-canvas-left"></aside>
```
*With jQuery*
```js
$('#off-canvas-left').offcanvas({
    modifiers: 'left' // default
});
```
####Right
*With HTML*
```html
<button data-offcanvas-trigger="off-canvas-right">Right</button>
<aside id="off-canvas-right" data-offcanvas-options='{ "modifiers": "right" }'></aside>
```
*With jQuery*
```js
$('#off-canvas-right').offcanvas({
    modifiers: 'right'
});
```

####Top
*With HTML*
```html

<button data-offcanvas-trigger="off-canvas-top">Top</button>
<aside id="off-canvas-top" data-offcanvas-options='{ "modifiers": "top" }'></aside>
```
*With jQuery*
```js
$('#off-canvas-top').offcanvas({
    modifiers: 'top'
});
```

####Bottom
*With HTML*
```html
<button data-offcanvas-trigger="off-canvas-bottom">Bottom</button>
<aside id="off-canvas-bottom" data-offcanvas-options='{ "modifiers": "bottom" }'></aside>
```
*With jQuery*
```js
$('#off-canvas-bottom').offcanvas({
    modifiers: 'bottom'
});
```

##Package managers

* Install with Bower: `bower install js-offcanvas --save`
* Install with npm: `npm install js-offcanvas`

##Dependencies
* jQuery
* Modernizr
* [js-utils](https://github.com/vmitsaras/js-utils)
* [js-trap-tab](https://github.com/vmitsaras/js-trap-tab)
* [js-button](https://github.com/vmitsaras/js-button)

---

[View Demo](http://offcanvas.vasilis.co)

Feel free to [let me know](http://www.twitter.com/vmitsaras) if you use js-offcanvas in one of your websites.

## Release History

* `v1.0.0`: Initial release.

## License
Licensed under the MIT license.