# js-offcanvas

An accessible, standards-compliant off-canvas navigation drawer built as a vanilla JavaScript class.

[Open the demo](https://vmitsaras.github.io/js-offcanvas/)

## Features

- **Accessible**: WCAG-minded ARIA attributes, keyboard support, focus trapping, and focus restore
- **Easy to style**: Works with regular HTML elements and CSS classes
- **Customizable**: Position, width, height, z-index, animation names, and inert targets
- **Lightweight**: No runtime dependencies
- **Auto-init**: Enhances existing markup and newly added markup automatically

## Setup

### Prerequisites

- **Node.js 18+** (Node.js 20 LTS recommended)
- **npm 9+**

### Install dependencies

```bash
git clone https://github.com/vmitsaras/js-offcanvas.git
cd js-offcanvas
npm install
```

### Run locally

```bash
npm run dev
```

Vite serves the demo at `http://localhost:5173`.

### Build

```bash
npm run build
```

The build outputs:

- `dist/js-offcanvas.min.js`
- `dist/js-offcanvas.es.js`
- `dist/js-offcanvas.min.css`

### Test and lint

```bash
npm test
npm run lint
```

## Installation

```bash
npm install js-offcanvas
```

```html
<link rel="stylesheet" href="./node_modules/js-offcanvas/dist/js-offcanvas.min.css">
<script type="module" src="./node_modules/js-offcanvas/dist/js-offcanvas.es.js"></script>
```

Or import it from your bundler:

```javascript
import 'js-offcanvas';
```

## Usage

Use ordinary HTML. The library auto-initializes elements matching `.js-offcanvas` or `[data-offcanvas]`, and overlays matching `.js-offcanvas-overlay`, or `[data-offcanvas-overlay]`.

```html
<button class="js-a11y-offcanvas-left" type="button">Open Left Panel</button>

<aside
    class="js-offcanvas"
    data-offcanvas
    id="a11yOffcanvas"
    animation-open="fadeInLeft"
    animation-close="fadeOutLeft"
    button-selector=".js-a11y-offcanvas-left"
    overlay-selector=".js-a11y-offcanvas-overlay"
    position="left"
    z-index="99"
    width="17em"
    height="100%"
    duration="0.2s"
    aria-labelledby="offcanvasLeftLabel">
    <div>
        <h2 id="offcanvasLeftLabel">Navigation Menu</h2>
        <ul>
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
            <li><a href="#" data-autofocus>Link 3</a></li>
            <li><a href="#">Link 4</a></li>
        </ul>
        <button data-offcanvas-close type="button">Close</button>
    </div>
</aside>

<div class="js-offcanvas-overlay js-a11y-offcanvas-overlay" data-offcanvas-overlay></div>
```

## JavaScript API

Auto-init attaches the controller instance to the element as `element.jsOffcanvas`. The most common public methods are also proxied onto the element for convenience.

```javascript
const panel = document.querySelector('#a11yOffcanvas');

panel.open();
panel.close();
panel.toggle();

const instance = panel.jsOffcanvas;
instance.setTriggerExpanded(true);
```

You can also initialize manually:

```javascript
import { JsOffcanvas, initOffcanvas } from 'js-offcanvas';

const instance = new JsOffcanvas(document.querySelector('#a11yOffcanvas'));
initOffcanvas();
```

## Configuration Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `position` | Panel position: `left`, `right`, `top`, `bottom` | `left` |
| `width` | Panel width | `18rem` |
| `height` | Panel height | `100%` |
| `duration` | Transition or animation duration | `0.3s` |
| `z-index` | Panel z-index | `100` |
| `button-selector` | CSS selector for the trigger button | - |
| `overlay-selector` | CSS selector for the overlay | - |
| `animation-open` | Animation name for opening | - |
| `animation-close` | Animation name for closing | - |
| `inert-selector` | Selector for elements to make inert while open | `body > :not(.js-offcanvas, [data-offcanvas], js-offcanvas, .js-offcanvas-overlay, [data-offcanvas-overlay], js-offcanvas-overlay)` |

## Events

Events dispatch from the offcanvas element:

- `init`
- `beforeopen`
- `open`
- `beforeclose`
- `close`

```javascript
document.querySelector('#a11yOffcanvas')
    .addEventListener('open', () => console.log('Offcanvas opened'));
```

## Accessibility Features

- `role="dialog"` and `aria-modal="true"` while open
- Trigger `aria-expanded` updates
- Tab and Shift+Tab focus loop
- Escape closes the panel unless focus is inside a form control
- Focus returns to the previous element or trigger after close
- Optional `inert` support for background content

## Browser Support

Works in modern browsers that support ES modules, `class`, `MutationObserver`, and standard DOM APIs.

## License

MIT License
