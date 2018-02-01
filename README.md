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

* Install with Bower: `bower install js-offcanvas --save`
* Install with npm: `npm install js-offcanvas`
* Install with yarn: `yarn add js-offcanvas`

##### JS & CSS
Include the `.css` and `.js` files in your site.
```html
<script src="js-offcanvas.pkgd.min.js"></script>
<link href="js-offcanvas.css" rel="stylesheet">
````
###### CDN
```html
<script src="https://unpkg.com/js-offcanvas/dist/_js/js-offcanvas.pkgd.min.js"></script> 
<link href="https://unpkg.com/js-offcanvas/dist/_css/prefixed/js-offcanvas.css" rel="stylesheet">
```

##### HTML
Offcanvas works on a container element with no styles applied. 
```html
    <div class="c-offcanvas-content-wrap">
        <a href="#offCanvas" id="triggerButton">Menu</a>
         <!-- Your Main Content goes here -->
    </div>
    
    <aside id="offCanvas"></aside>
```
##### Initialize
```js

$('#offCanvas').offcanvas({
    modifiers: 'left, overlay', // default options
    triggerButton: '#triggerButton' // btn to open offcanvas
});
```

##### Initialize with HTML
###### Trigger Button
Include the CSS-Class `js-offcanvas-trigger`  and `data-offcanvas-trigger="id-of-your-offcanvas"`
```html
<a  class="js-offcanvas-trigger" 
    data-offcanvas-trigger="off-canvas-id"
    href="#off-canvas">Menu</a>
````
###### Offcanvas Element
Include the CSS-Class `js-offcanvas`  and `data-offcanvas-options="{options}"`
```html
<aside class="js-offcanvas" 
       data-offcanvas-options='{"modifiers": "left,overlay"}' 
       id="off-canvas-id">...</aside>
```
###### Trigger Enhance
```js   
  // you have to trigger enhance
   $( function(){
       $(document).trigger("enhance");
   });
   ```

## Options
```js   
$('#offCanvas').offcanvas({    
    role: "dialog",
    modifiers: "left,overlay",
    baseClass: "c-offcanvas",
    modalClass: "c-offcanvas-bg",
    contentClass: "c-offcanvas-content-wrap",
    closeButtonClass: "js-offcanvas-close",
    bodyModifierClass: "has-offcanvas",
    supportNoTransitionsClass: "support-no-transitions",
    resize: false,
    triggerButton: '#triggerButton' ,
    modal: true,
    onOpen: function() {},
    onClose: function() {},
    onInit: function() {}
})
.on( "create.offcanvas", function( e ){ } )
.on( "open.offcanvas", function( e ){ } )
.on( "opening.offcanvas", function( e ){ } )
.on( "close.offcanvas", function( e ){ } )
.on( "closing.offcanvas", function( e ){ } )
.on( "resizing.offcanvas", function( e ){ } );
   ```

## Examples on Codepen
* [Collection](https://codepen.io/collection/ArLPWW/)
* [Codepen Template](https://codepen.io/vmitsaras/pen/jrGAOa)
* [Demo Site Examples](https://codepen.io/vmitsaras/pen/gwGwJE)
* [Full Width](https://codepen.io/vmitsaras/pen/ZpXAmA)
* [Codrops  SVG Shape Overlays](https://codepen.io/vmitsaras/pen/MOQqmX)
#### Bootstrap v4
* [Dashboard](https://codepen.io/vmitsaras/full/pWNrEy/) 
* [Starter](https://codepen.io/vmitsaras/full/veyJmv/)
* [Boxed Layout](https://codepen.io/vmitsaras/pen/wrLePg)

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
| **resize**      | false      |boolean|
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
  
[http://offcanvas.vasilis.co](http://offcanvas.vasilis.co)


## Dependencies
* jQuery
* Modernizr

---

## License
Licensed under the MIT license.
