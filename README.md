# js-offcanvas 

[![Downloads](https://img.shields.io/npm/dt/js-offcanvas.svg)](https://www.npmjs.com/package/js-offcanvas) [![Version](https://img.shields.io/npm/v/js-offcanvas.svg)](https://www.npmjs.com/package/js-offcanvas) [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](http://twitter.com/?status=@vmitsaras) 

jQuery accessible Offcanvas plugin, using ARIA

[View Demo](http://offcanvas.vasilis.co) | [Edit on Codepen](http://codepen.io/vmitsaras/pen/gwGwJE)

## Why it is accessible

- It relies on <a href="https://www.w3.org/TR/wai-aria-practices/#dialog_modal"><abbr title="Accessible Rich Internet Application">ARIA</abbr> Design pattern for Dialogs</a>
- The tab key loops through all of the keyboard focusable items within the offcanvas
- You can close it using <kbd>Esc</kbd>.

## Features

- Uses CSS transforms & transitions.
- BEM <kbd>c-offcanvas c-offcanvas--left is-open</kbd>
- From Any Direction: left, right, top and bottom.
- Overlay, Reveal and Push.
- API & Events
- Package managers Bower & NPM

***
 
---

## Getting Started
##### JS & CSS
Include the Offcanvas `.css` and `.js` files in your site.
```html
<script src="js-offcanvas.pkgd.min.js"></script>
<link href="js-offcanvas.css" rel="stylesheet">
```

##### HTML
Offcanvas works on a container element with no styles applied. 
```html
<body>
    <div class="c-offcanvas-content-wrap">
        ...
        <a href="#off-canvas" data-offcanvas-trigger="off-canvas">Menu</a>
        ...
    </div>
    <aside class="js-offcanvas" id="off-canvas"></aside>
</body>

```
##### Initialize
```js

$('#off-canvas').offcanvas({
// options
});
// or trigger enhance - Initialize with HTML 
$( function(){
    $(document).trigger("enhance");
});
```

#### Initialize with HTML     

```html
<a class="js-offcanvas-trigger" data-offcanvas-trigger="off-canvas" href="#off-canvas">Menu</a>
<aside class="js-offcanvas" data-offcanvas-options='{ "modifiers": "left,overlay" }' id="off-canvas"></aside>
```

# Options
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
| **triggerButton**      | null      |string|
| **onInit**      | null      |function|
| **onOpen**      | null      |function|
| **onClose**      | null      |function|

## API
The offcanvas API offers a couple of methods to control the offcanvas and are publicly available to all active instances.

```js
var dataOffcanvas = $('#off-canvas').data('offcanvas-component');
```
## Methods
#### `open`
```js
dataOffcanvas.open();
```
#### `close`
```js
dataOffcanvas.close();
```
#### `toggle`
```js
dataOffcanvas.toggle();
```
### Callbacks
#### `onInit`
Fires an event when offcanvas is initialized.
```js
dataOffcanvas.onInit = function() {
    console.log(this);
};
```
#### `onOpen`
Fires an event when offcanvas is opened.
```js
dataOffcanvas.onOpen = function() {
    console.log('Callback onOpen');
};
```
#### `onClose `
Fires an event when offcanvas is closed.
```js
dataOffcanvas.onClose  = function() {
    console.log(this);
};
```
## Events
jQuery.offcanvas fires several events. Simply listen for them with the jQuery.on function. All events are namespaced with offcanvas.

#### `beforecreate `
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
#### `create `
Fired once the Plugin is initialized.
```js
$( document ).on( "create.offcanvas", function( e ){ } );
```
#### `open `
Fired when the `open` method is called.
```js
$( document ).on( "open.offcanvas", function( e ){ } );
```
#### `close `
Fired when the `close` method is called.
```js
$( document ).on( "close.offcanvas", function( e ){ } );
```
#### `resizing `
Fired when the window is resized.
```js
$( document ).on( "resizing.offcanvas", function( e ){ } );
```
#### `clicked `
Fired when the trigger-btn is clicked.
```js
$( document ).on( "clicked.offcanvas-trigger", function( e ){
    var dataBtnText = $( e.target ).text();
    console.log(e.type + '.' + e.namespace + ': ' + dataBtnText);
} );
```

## Examples
#### Basic
*With HTML*
```html
<button data-offcanvas-trigger="off-canvas-left">Left</button>
<aside class="js-offcanvas" id="off-canvas-left"></aside>
```
*With jQuery*
```js
$('#off-canvas-left').offcanvas({
    modifiers: 'left, overlay', // options
    triggerButton: '.js-left' // btn to open offcanvas
});
```
```html
<button class="js-left">Left</button>
<aside id="off-canvas-left"></aside>
```
#### Bootstrap
check demo dashboard & starter

## Package managers

* Install with Bower: `bower install js-offcanvas --save`
* Install with npm: `npm install js-offcanvas`

## Dependencies
* jQuery
* Modernizr

---

[View Demo](http://offcanvas.vasilis.co)

Feel free to [let me know](http://www.twitter.com/vmitsaras) if you use js-offcanvas in one of your websites.

## Release History

* `v1.1.0`: Missing Options.
* `v1.0.0`: Initial release.

## License
Licensed under the MIT license.
