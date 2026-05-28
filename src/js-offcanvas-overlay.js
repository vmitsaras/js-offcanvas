const OVERLAY_SELECTOR = '.js-offcanvas-overlay, [data-offcanvas-overlay], js-offcanvas-overlay';
const OVERLAY_INSTANCE_KEY = 'jsOffcanvasOverlay';

/**
 * Class representing the overlay for the offcanvas component.
 */
class JsOffcanvasOverlay {
    /**
     * Create an overlay controller for a regular DOM element.
     * @param {HTMLElement|string} element - The element or selector to enhance.
     */
    constructor(element) {
        const resolvedElement = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        if (!(resolvedElement instanceof HTMLElement)) {
            throw new TypeError('[js-offcanvas] A valid overlay HTMLElement is required.');
        }

        if (resolvedElement[OVERLAY_INSTANCE_KEY]) {
            return resolvedElement[OVERLAY_INSTANCE_KEY];
        }

        this.element = resolvedElement;
        resolvedElement[OVERLAY_INSTANCE_KEY] = this;
        this._installElementProxies();
        this._init();
    }

    /**
     * Get the selectors that auto-init should enhance.
     * @return {string}
     */
    static get selector() {
        return OVERLAY_SELECTOR;
    }

    /**
     * Initialize every overlay element in a root.
     * @param {Document|Element} root - The root to query.
     * @return {Array<JsOffcanvasOverlay>} Created or existing instances.
     */
    static initAll(root = document) {
        return queryAllSafe(OVERLAY_SELECTOR, root)
            .filter(el => el instanceof HTMLElement)
            .map(el => new JsOffcanvasOverlay(el));
    }

    /**
     * Get the instance attached to an element.
     * @param {HTMLElement|string} element - The element or selector.
     * @return {JsOffcanvasOverlay|null}
     */
    static getInstance(element) {
        const resolvedElement = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        return resolvedElement?.[OVERLAY_INSTANCE_KEY] || null;
    }

    /**
     * Proxy the public API onto the element for backwards-friendly access.
     * @private
     */
    _installElementProxies() {
        this.element.show = this.show.bind(this);
        this.element.hide = this.hide.bind(this);
        this.element.destroy = this.destroy.bind(this);
    }

    /**
     * Initialize the overlay element.
     * @private
     */
    _init() {
        this.element.setAttribute('aria-hidden', this.element.hasAttribute('open') ? 'false' : 'true');

        if (!this.element.hasAttribute('class')) {
            this.element.classList.add('js-offcanvas-overlay');
        }
    }

    /**
     * Show the overlay.
     */
    show() {
        this.element.setAttribute('open', '');
        this.element.setAttribute('aria-hidden', 'false');
    }

    /**
     * Hide the overlay.
     */
    hide() {
        this.element.removeAttribute('open');
        this.element.setAttribute('aria-hidden', 'true');
    }

    /**
     * Remove the overlay instance from the element.
     */
    destroy() {
        delete this.element[OVERLAY_INSTANCE_KEY];
    }
}

/**
 * Safely query all selector-driven elements.
 * @param {string|null} selector - The CSS selector to query.
 * @param {Document|Element} context - The context in which to query.
 * @return {Array<Element>} The matched elements.
 */
function queryAllSafe(selector, context = document) {
    if (!selector) return [];

    try {
        const matches = [];

        if (context instanceof Element && context.matches(selector)) {
            matches.push(context);
        }

        matches.push(...Array.from(context.querySelectorAll(selector)));
        return matches;
    } catch {
        return [];
    }
}

export { OVERLAY_SELECTOR };
export default JsOffcanvasOverlay;
