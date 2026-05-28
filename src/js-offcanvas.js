import JsOffcanvasOverlay from './js-offcanvas-overlay.js';

const OFFCANVAS_SELECTOR = '.js-offcanvas, [data-offcanvas]';
const INSTANCE_KEY = 'jsOffcanvas';
const REINIT_ATTRIBUTES = ['button-selector', 'overlay-selector', 'inert-selector', 'animation', 'animation-open', 'animation-close'];
const PROXY_METHODS = [
    'open',
    'close',
    'toggle',
    'setTriggerExpanded',
    'btnExpandend',
    'trapFocus',
    'removeTrapFocus',
    'destroy'
];
let autoInitStarted = false;

/**
 * Class representing an accessible off-canvas controller.
 */
class JsOffcanvas {
    /**
     * Create an off-canvas controller for a regular DOM element.
     * @param {HTMLElement|string} element - The element or selector to enhance.
     */
    constructor(element) {
        const resolvedElement = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        if (!(resolvedElement instanceof HTMLElement)) {
            throw new TypeError('[js-offcanvas] A valid HTMLElement is required.');
        }

        if (resolvedElement[INSTANCE_KEY]) {
            return resolvedElement[INSTANCE_KEY];
        }

        this.element = resolvedElement;
        this._init = this._init.bind(this);
        this._handleMutations = this._handleMutations.bind(this);
        this._observer = new MutationObserver(this._handleMutations);
        this._isInitialized = false;
        this.focusedElem = null;
        this._clickFn = this._clickFn.bind(this);
        this._clickOpen = this._clickOpen.bind(this);
        this._keydownFn = this._keydownFn.bind(this);
        this._documentKeydownFn = this._documentKeydownFn.bind(this);
        this._isBound = false;
        this._listeners = new Map();
        this._escapeListenerActive = false;
        this._hasWarnedDeprecatedBtnExpandend = false;
        this._boundTriggerButton = null;
        this._focusTrapActive = false;
        this._inertState = new Map();
        this._pendingTransitionCleanup = null;
        this._backupFocusedElem = null;
        this._supportsInert = 'inert' in HTMLElement.prototype;
        this._hasTemporaryTabindex = false;

        this._trapFocusFn = (event) => {
            if (event.key !== 'Tab') return;

            const focusableEls = this._getFocusableElements();

            if (focusableEls.length === 0) return;

            const firstFocusableEl = focusableEls[0];
            const lastFocusableEl = focusableEls[focusableEls.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && (activeElement === firstFocusableEl || activeElement === this.element || event.target === this.element)) {
                event.preventDefault();
                lastFocusableEl.focus();
            } else if (!event.shiftKey && (activeElement === lastFocusableEl || event.target === lastFocusableEl)) {
                event.preventDefault();
                firstFocusableEl.focus();
            }
        };

        resolvedElement[INSTANCE_KEY] = this;
        this._installElementProxies();
        this._init();
        this._observer.observe(this.element, {
            attributes: true,
            attributeFilter: JsOffcanvas.observedAttributes,
            childList: true
        });
    }

    /**
     * Get the selectors that auto-init should enhance.
     * @return {string}
     */
    static get selector() {
        return OFFCANVAS_SELECTOR;
    }

    /**
     * Get the list of observed attributes.
     * @return {Array<string>} The list of observed attributes.
     */
    static get observedAttributes() {
        return [
            'button-selector',
            'overlay-selector',
            'inert-selector',
            'animation',
            'width',
            'height',
            'duration',
            'z-index',
            'animation-open',
            'animation-close'
        ];
    }

    /**
     * Initialize every off-canvas element in a root.
     * @param {Document|Element} root - The root to query.
     * @return {Array<JsOffcanvas>} Created or existing instances.
     */
    static initAll(root = document) {
        return queryAllSafe(OFFCANVAS_SELECTOR, root)
            .filter(el => el instanceof HTMLElement)
            .map(el => new JsOffcanvas(el));
    }

    /**
     * Get the instance attached to an element.
     * @param {HTMLElement|string} element - The element or selector.
     * @return {JsOffcanvas|null}
     */
    static getInstance(element) {
        const resolvedElement = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        return resolvedElement?.[INSTANCE_KEY] || null;
    }

    /**
     * Determine whether animation mode is enabled via attribute presence.
     * @return {boolean} True when animation mode is enabled.
     */
    get useAnimation() {
        return this.hasAttribute('animation')
            || this.hasAttribute('animation-open')
            || this.hasAttribute('animation-close');
    }

    /**
     * Getter for isHidden.
     * @return {boolean} - Returns `true` if the component is hidden, else `false`.
     */
    get isHidden() {
        return this.getAttribute('aria-hidden') === 'true';
    }

    /**
     * Setter for isHidden.
     * @param {boolean} val - Sets the visibility state; `true` hides the component, `false` shows it.
     */
    set isHidden(val) {
        this.setAttribute('aria-hidden', val ? 'true' : 'false');
    }

    /**
     * Get the width attribute.
     * @return {string|null} The width attribute.
     */
    get width() {
        return this.getAttribute('width');
    }

    /**
     * Set the width attribute.
     * @param {string} val - The new value for the width attribute.
     */
    set width(val) {
        this.setAttribute('width', val);
    }

    /**
     * Get the height attribute.
     * @return {string|null} The height attribute.
     */
    get height() {
        return this.getAttribute('height');
    }

    /**
     * Set the height attribute.
     * @param {string} val - The new value for the height attribute.
     */
    set height(val) {
        this.setAttribute('height', val);
    }

    /**
     * Get the duration attribute.
     * @return {string|null} The duration attribute.
     */
    get duration() {
        return this.getAttribute('duration');
    }

    /**
     * Set the duration attribute.
     * @param {string} val - The new value for the duration attribute.
     */
    set duration(val) {
        this.setAttribute('duration', val);
    }

    /**
     * Get the button-selector attribute.
     * @return {string|null} The button-selector attribute.
     */
    get buttonSelector() {
        return this.getAttribute('button-selector');
    }

    /**
     * Get the overlay-selector attribute.
     * @return {string|null} The overlay-selector attribute.
     */
    get overlaySelector() {
        return this.getAttribute('overlay-selector');
    }

    /**
     * Get the inert-selector attribute.
     * @return {string} The inert-selector attribute.
     */
    get inertSelector() {
        return this.getAttribute('inert-selector')
            || 'body > :not(.js-offcanvas, [data-offcanvas], js-offcanvas, .js-offcanvas-overlay, [data-offcanvas-overlay], js-offcanvas-overlay)';
    }

    /**
     * Proxy the public API onto the element for backwards-friendly access.
     * @private
     */
    _installElementProxies() {
        PROXY_METHODS.forEach(methodName => {
            this.element[methodName] = this[methodName].bind(this);
        });

        Object.defineProperty(this.element, 'isHidden', {
            configurable: true,
            get: () => this.isHidden,
            set: val => {
                this.isHidden = val;
            }
        });
    }

    /**
     * Handle mutations observed on the controlled element.
     * @param {Array<MutationRecord>} mutations - The observed mutations.
     * @private
     */
    _handleMutations(mutations) {
        const shouldReinitialize = mutations.some(mutation => mutation.type === 'childList'
            || REINIT_ATTRIBUTES.includes(mutation.attributeName));

        mutations
            .filter(mutation => mutation.type === 'attributes')
            .forEach(mutation => {
                this._attributeChanged(mutation.attributeName);
            });

        if (shouldReinitialize) {
            this._init();
        }
    }

    /**
     * Handle an observed attribute change.
     * @param {string} name - The changed attribute.
     * @private
     */
    _attributeChanged(name) {
        const newValue = this.getAttribute(name);

        switch (name) {
            case 'height':
            case 'width':
            case 'z-index':
            case 'duration':
                this._setProperty(`--js-offcanvas-${name}`, newValue);
                break;
            case 'animation-open':
                this._setProperty('--js-offcanvas-animation-in', newValue);
                break;
            case 'animation-close':
                this._setProperty('--js-offcanvas-animation-out', newValue);
                break;
        }
    }

    /**
     * Initialize the component.
     */
    _init() {
        const wasOpen = this._isInitialized && !this.isHidden;

        if (this._isInitialized) {
            this._removeBoundEvents();
            this._isBound = false;
        }

        if (!wasOpen) {
            this.isHidden = true;
            this.focusedElem = null;
        }

        JsOffcanvas.observedAttributes.forEach(attributeName => this._attributeChanged(attributeName));

        this.cssEndEvent = this.useAnimation ? 'animationend' : 'transitionend';
        this.triggerButton = queryOneSafe(this.buttonSelector);
        this.overlay = queryOneSafe(this.overlaySelector);
        this._enhanceMarkup();

        if (!this._isBound) {
            this.bindEvents();
            this._isBound = true;
        }

        if (wasOpen) {
            this._setOpenState();
            this._addEscapeListener();
            this._trapFocus();
        } else {
            this.setTriggerExpanded(false);
        }

        this._isInitialized = true;
        this.dispatchEvent(this._makeEvent('init'));
    }

    /**
     * Create a custom event.
     * @param {string} evtName - The name of the event.
     * @param {Object} evtDetail - The details of the event.
     * @param {Object} evtOptions - Additional event options.
     * @return {CustomEvent} The custom event.
     */
    _makeEvent(evtName, evtDetail, evtOptions = {}) {
        return new CustomEvent(evtName, {
            bubbles: true,
            cancelable: Boolean(evtOptions.cancelable),
            detail: evtDetail
        });
    }

    /**
     * Get an attribute from the controlled element.
     * @param {string} name - The attribute name.
     * @return {string|null}
     */
    getAttribute(name) {
        return this.element.getAttribute(name);
    }

    /**
     * Set an attribute on the controlled element.
     * @param {string} name - The attribute name.
     * @param {string} value - The attribute value.
     */
    setAttribute(name, value) {
        this.element.setAttribute(name, value);
    }

    /**
     * Check an attribute on the controlled element.
     * @param {string} name - The attribute name.
     * @return {boolean}
     */
    hasAttribute(name) {
        return this.element.hasAttribute(name);
    }

    /**
     * Remove an attribute from the controlled element.
     * @param {string} name - The attribute name.
     */
    removeAttribute(name) {
        this.element.removeAttribute(name);
    }

    /**
     * Dispatch an event from the controlled element.
     * @param {Event} event - The event to dispatch.
     * @return {boolean}
     */
    dispatchEvent(event) {
        return this.element.dispatchEvent(event);
    }

    /**
     * Add an event listener to the controlled element.
     * @param {string} type - The event type.
     * @param {Function} listener - The event listener.
     */
    addEventListener(type, listener) {
        this.element.addEventListener(type, listener);
    }

    /**
     * Remove an event listener from the controlled element.
     * @param {string} type - The event type.
     * @param {Function} listener - The event listener.
     */
    removeEventListener(type, listener) {
        this.element.removeEventListener(type, listener);
    }

    /**
     * Set a CSS property.
     * @param {string} varName - The name of the CSS variable.
     * @param {string|null} value - The value of the CSS variable.
     */
    _setProperty(varName, value) {
        if (value === null || value === '') {
            this.element.style.removeProperty(varName);
            return;
        }

        this.element.style.setProperty(varName, value);
    }

    /**
     * Safely query all selector-driven elements within the controlled element.
     * @param {string} selector - The CSS selector to query.
     * @return {Array<Element>} The matched elements.
     * @private
     */
    _querySelectorAll(selector) {
        return queryAllSafe(selector, this.element);
    }

    /**
     * Get visible focusable elements within the component.
     * @return {Array<HTMLElement>} The focusable elements.
     * @private
     */
    _getFocusableElements() {
        const focusableSelector = [
            'a[href]',
            'area[href]',
            'button:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]:not([contenteditable="false"])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        return this._querySelectorAll(focusableSelector).filter(el => {
            const tabIndexAttr = el.getAttribute('tabindex');

            if (tabIndexAttr !== null && Number(tabIndexAttr) < 0) {
                return false;
            }

            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
    }

    /**
     * Enhance the markup of the component.
     */
    _enhanceMarkup() {
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '-1');
            this._hasTemporaryTabindex = true;
        } else if (!(this._hasTemporaryTabindex && this.getAttribute('tabindex') === '-1')) {
            this._hasTemporaryTabindex = false;
        }

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'dialog');
        }
    }

    /**
     * Trap focus within the component.
     */
    trapFocus() {
        if (this._focusTrapActive) return;

        this.addEventListener('keydown', this._trapFocusFn);
        this._focusTrapActive = true;
    }

    /**
     * Trap focus within the off-canvas element using inert.
     * @private
     */
    _trapFocus() {
        this.trapFocus();

        if (this._supportsInert) {
            this._applyInertAttribute(true);
        }
    }

    /**
     * Apply the inert attribute to elements outside the offcanvas.
     * @param {boolean} makeInert - Whether to make elements outside inert.
     * @private
     */
    _applyInertAttribute(makeInert) {
        const elements = this._getInertCandidates();

        elements.forEach(el => {
            if (makeInert) {
                if (!this._inertState.has(el)) {
                    this._inertState.set(el, el.inert);
                }

                el.inert = true;
            } else if (this._inertState.has(el)) {
                el.inert = this._inertState.get(el);
                this._inertState.delete(el);
            }
        });

        if (!makeInert) {
            this._inertState.forEach((wasInert, el) => {
                el.inert = wasInert;
            });
            this._inertState.clear();
        }
    }

    /**
     * Get elements that should receive inert when the panel opens.
     * @return {Array<HTMLElement>}
     * @private
     */
    _getInertCandidates() {
        return queryAllSafe(this.inertSelector)
            .filter(el => el instanceof HTMLElement)
            .filter(el => el !== this.element)
            .filter(el => !this.element.contains(el))
            .filter(el => !this.overlay || el !== this.overlay);
    }

    /**
     * Remove inert attribute from elements outside the offcanvas.
     * @private
     */
    _removeInertAttribute() {
        this._applyInertAttribute(false);
    }

    /**
     * Remove the focus trap.
     */
    removeTrapFocus() {
        if (this._focusTrapActive) {
            this.removeEventListener('keydown', this._trapFocusFn);
            this._focusTrapActive = false;
        }

        if (this._supportsInert) {
            this._removeInertAttribute();
        }
    }

    /**
     * Open the component.
     */
    open() {
        if (!this.isHidden) return;

        if (!this.dispatchEvent(this._makeEvent('beforeopen', undefined, { cancelable: true }))) {
            return;
        }

        this.focusedElem = document.activeElement;
        this._backupFocusedElem = this.focusedElem;

        this._setOpenState();
        this._addEscapeListener();
        this._runAfterOpenTransition();
    }

    /**
     * Close the component.
     */
    close() {
        if (this.isHidden) return;

        if (!this.dispatchEvent(this._makeEvent('beforeclose', undefined, { cancelable: true }))) {
            return;
        }

        if (this.element.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        this._removeEscapeListener();
        this._setClosedState();
        this._runAfterCloseTransition();
    }

    /**
     * Apply all immediate state updates needed when opening.
     * @private
     */
    _setOpenState() {
        this.setAttribute('aria-modal', 'true');
        this.setAttribute('open', '');
        this.setTriggerExpanded(true);

        this.isHidden = false;
        this.showOverlay(true);
    }

    /**
     * Apply all immediate state updates needed when closing.
     * @private
     */
    _setClosedState() {
        this.isHidden = true;
        this.removeAttribute('aria-modal');
        this.showOverlay(false);
    }

    /**
     * Clear a pending transition or animation completion listener.
     * @private
     */
    _clearPendingTransition() {
        if (!this._pendingTransitionCleanup) return;

        this._pendingTransitionCleanup();
        this._pendingTransitionCleanup = null;
    }

    /**
     * Run a callback after the current transition or animation completes.
     * @param {Function} callback - The callback to run.
     * @private
     */
    _runAfterTransition(callback) {
        this._clearPendingTransition();

        if (!this._hasTransitionOrAnimation()) {
            callback();
            return;
        }

        let fallbackTimer;
        const complete = (event) => {
            if (event && event.target !== this.element) return;

            cleanup();
            callback();
        };
        const cleanup = () => {
            this.removeEventListener(this.cssEndEvent, complete);
            window.clearTimeout(fallbackTimer);

            if (this._pendingTransitionCleanup === cleanup) {
                this._pendingTransitionCleanup = null;
            }
        };

        this.addEventListener(this.cssEndEvent, complete);
        fallbackTimer = window.setTimeout(complete, this._getTransitionTimeout() + 50);
        this._pendingTransitionCleanup = cleanup;
    }

    /**
     * Execute the post-open behavior immediately or after transition/animation.
     * @private
     */
    _runAfterOpenTransition() {
        const onOpenComplete = () => {
            if (this.isHidden) return;

            const getAutofocus = this.element.querySelector('[autofocus]')
                || this.element.querySelector('[data-autofocus]');

            requestAnimationFrame(() => {
                if (getAutofocus) {
                    getAutofocus.focus();
                } else {
                    this.element.focus();
                }
            });

            this._trapFocus();
            this.dispatchEvent(this._makeEvent('open'));
        };

        this._runAfterTransition(onOpenComplete);
    }

    /**
     * Execute the post-close behavior immediately or after transition/animation.
     * @private
     */
    _runAfterCloseTransition() {
        const onCloseComplete = () => {
            if (!this.isHidden) return;
            this.removeTrapFocus();
            this._restoreFocusAfterClose();

            if (this._hasTemporaryTabindex) {
                this.removeAttribute('tabindex');
            }

            this.removeAttribute('open');
            this.setTriggerExpanded(false);
            this.showOverlay(false);

            this.dispatchEvent(this._makeEvent('close'));
        };

        this._runAfterTransition(onCloseComplete);
    }

    /**
     * Returns whether this element has a transition or animation to wait for.
     * @return {boolean}
     * @private
     */
    _hasTransitionOrAnimation() {
        return this._getTransitionTimeout() > 0;
    }

    /**
     * Get the longest transition or animation duration plus delay in milliseconds.
     * @return {number}
     * @private
     */
    _getTransitionTimeout() {
        const computedStyle = window.getComputedStyle(this.element);
        const transitionDuration = this._getMaxCssTime(
            computedStyle.transitionDuration,
            computedStyle.transitionDelay
        );
        const animationDuration = this._getMaxCssTime(
            computedStyle.animationDuration,
            computedStyle.animationDelay
        );

        if (this.useAnimation) {
            return animationDuration;
        }

        return Math.max(transitionDuration, animationDuration);
    }

    /**
     * Get the longest duration plus matching delay from CSS time lists.
     * @param {string} durations - CSS duration list.
     * @param {string} delays - CSS delay list.
     * @return {number}
     * @private
     */
    _getMaxCssTime(durations, delays) {
        const durationList = this._parseCssTimeList(durations);
        const delayList = this._parseCssTimeList(delays);
        const itemCount = Math.max(durationList.length, delayList.length);
        let maxTime = 0;

        for (let index = 0; index < itemCount; index++) {
            const duration = durationList[index] ?? durationList[durationList.length - 1] ?? 0;
            const delay = delayList[index] ?? delayList[delayList.length - 1] ?? 0;

            maxTime = Math.max(maxTime, duration + delay);
        }

        return maxTime;
    }

    /**
     * Convert a CSS time list to milliseconds.
     * @param {string} value - CSS time list.
     * @return {Array<number>}
     * @private
     */
    _parseCssTimeList(value) {
        if (!value) return [0];

        return value.split(',').map(time => {
            const normalizedTime = time.trim().toLowerCase();
            const numericValue = parseFloat(normalizedTime);

            if (Number.isNaN(numericValue)) return 0;

            return normalizedTime.endsWith('ms') ? numericValue : numericValue * 1000;
        });
    }

    /**
     * Restore focus to the previously focused element when possible.
     * @private
     */
    _restoreFocusAfterClose() {
        const elemToFocus = this.focusedElem || this._backupFocusedElem;
        const focusTrigger = () => {
            if (this.triggerButton) {
                this.triggerButton.focus();
            }
        };

        if (elemToFocus) {
            requestAnimationFrame(() => {
                try {
                    if (!this.element.contains(elemToFocus) && document.body.contains(elemToFocus)) {
                        elemToFocus.focus();
                        return;
                    }

                    focusTrigger();
                } catch {
                    focusTrigger();
                }
            });
        } else {
            requestAnimationFrame(() => {
                focusTrigger();
            });
        }

        this.focusedElem = null;
        this._backupFocusedElem = null;
    }

    /**
     * Add the Escape key listener at document level once.
     * @private
     */
    _addEscapeListener() {
        if (this._escapeListenerActive) return;

        document.addEventListener('keydown', this._documentKeydownFn);
        this._escapeListenerActive = true;
    }

    /**
     * Remove the Escape key listener from document level when active.
     * @private
     */
    _removeEscapeListener() {
        if (!this._escapeListenerActive) return;

        document.removeEventListener('keydown', this._documentKeydownFn);
        this._escapeListenerActive = false;
    }

    /**
     * Handle document-level keyboard events while the panel is open.
     * @param {KeyboardEvent} event - The keyboard event.
     * @private
     */
    _documentKeydownFn(event) {
        if (event.key !== 'Escape') return;

        this._keydownFn(event);
    }

    /**
     * Show or hide the overlay.
     * @param {boolean} show - Whether to show the overlay.
     */
    showOverlay(show) {
        if (!this.overlay) return;

        const overlayInstance = this.overlay.jsOffcanvasOverlay;
        const methodName = show ? 'show' : 'hide';

        if (overlayInstance && typeof overlayInstance[methodName] === 'function') {
            overlayInstance[methodName]();
            return;
        }

        if (typeof this.overlay[methodName] === 'function') {
            this.overlay[methodName]();
            return;
        }

        if (show) {
            this.overlay.setAttribute('open', '');
            this.overlay.setAttribute('aria-hidden', 'false');
        } else {
            this.overlay.removeAttribute('open');
            this.overlay.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Listen for events on a specific selector.
     * @param {string} type - The event type.
     * @param {string} selector - The CSS selector.
     * @param {Function} callback - The callback function.
     * @param {Document|Element} context - The context in which to listen for events.
     * @private
     */
    _listen(type, selector, callback, context) {
        const listener = (event) => {
            if (!(event.target instanceof Element)) return;

            let target;
            try {
                target = event.target.closest(selector);
            } catch {
                return;
            }

            if (target && (context === document || context.contains(target))) {
                callback(event, target);
            }
        };

        if (!this._listeners.has(context)) {
            this._listeners.set(context, []);
        }

        this._listeners.get(context).push({
            type,
            listener
        });

        context.addEventListener(type, listener);
    }

    /**
     * Remove all event listeners that were added with _listen.
     * @private
     */
    _removeAllListeners() {
        this._listeners.forEach((listeners, context) => {
            if (context && typeof context.removeEventListener === 'function') {
                listeners.forEach(({ type, listener }) => {
                    context.removeEventListener(type, listener);
                });
            }
        });

        this._listeners.clear();
    }

    /**
     * Bind the current trigger button's direct events.
     * @private
     */
    _bindTriggerButtonEvents() {
        if (!this.triggerButton || this._boundTriggerButton === this.triggerButton) return;

        this._unbindTriggerButtonEvents();
        this.triggerButton.addEventListener('click', this._clickFn);
        this.triggerButton.addEventListener('keydown', this._keydownFn);
        this._boundTriggerButton = this.triggerButton;
    }

    /**
     * Remove direct events from the previously bound trigger button.
     * @private
     */
    _unbindTriggerButtonEvents() {
        if (!this._boundTriggerButton) return;

        this._boundTriggerButton.removeEventListener('click', this._clickFn);
        this._boundTriggerButton.removeEventListener('keydown', this._keydownFn);
        this._boundTriggerButton = null;
    }

    /**
     * Remove listeners that are bound during component initialization.
     * @private
     */
    _removeBoundEvents() {
        this._removeAllListeners();
        this._unbindTriggerButtonEvents();
    }

    /**
     * Bind events to the component.
     */
    bindEvents() {
        if (this.overlaySelector) {
            this._listen('click', this.overlaySelector, (event) => {
                event.preventDefault();
                this.close();
            }, document);
        }

        this._listen('click', '[data-offcanvas-close]', (event, target) => {
            event.preventDefault();
            target.blur();
            this.close();
        }, this.element);

        this._bindTriggerButtonEvents();
    }

    /**
     * Toggle the visibility of the component.
     */
    toggle() {
        this.isHidden ? this.open() : this.close();
    }

    /**
     * Set the aria-expanded attribute on the trigger button.
     * @param {boolean} val - The value for the aria-expanded attribute.
     */
    setTriggerExpanded(val) {
        if (this.triggerButton) {
            this.triggerButton.setAttribute('aria-expanded', val ? 'true' : 'false');

            if (!this.triggerButton.getAttribute('aria-label')
                && !this.triggerButton.getAttribute('aria-labelledby')) {
                const position = this.getAttribute('position') || 'left';
                this.triggerButton.setAttribute('aria-label', `Toggle ${position} panel`);
            }
        }
    }

    /**
     * @deprecated Use setTriggerExpanded instead.
     * @param {boolean} val - The value for the aria-expanded attribute.
     */
    btnExpandend(val) {
        if (!this._hasWarnedDeprecatedBtnExpandend
            && typeof console !== 'undefined'
            && typeof console.warn === 'function') {
            console.warn('[js-offcanvas] btnExpandend() is deprecated and will be removed in a future major release. Use setTriggerExpanded() instead.');
            this._hasWarnedDeprecatedBtnExpandend = true;
        }

        this.setTriggerExpanded(val);
    }

    /**
     * Handle the click event.
     * @param {Event} event - The event object.
     * @private
     */
    _clickFn(event) {
        this._clickOpen(event);
    }

    /**
     * Handle the click event to open the component.
     * @param {Event} event - The event object.
     * @private
     */
    _clickOpen(event) {
        event.preventDefault();
        this.toggle();
    }

    /**
     * Handle the keydown event.
     * @param {KeyboardEvent} event - The event object.
     * @private
     */
    _keydownFn(event) {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === this.triggerButton) {
            event.preventDefault();
            this.focusedElem = event.target;
            this._clickOpen(event);
        } else if (event.key === 'Escape' && !this.isHidden) {
            const activeElement = document.activeElement;
            const isFormControl = activeElement && (
                activeElement.tagName === 'INPUT'
                || activeElement.tagName === 'TEXTAREA'
                || activeElement.tagName === 'SELECT'
                || activeElement.isContentEditable
            );

            if (!isFormControl) {
                event.preventDefault();
                this.close();
            }
        }
    }

    /**
     * Clean up all listeners and observers.
     */
    destroy() {
        if (!this.hasAttribute('aria-hidden')) {
            this.isHidden = true;
        }

        this._observer.disconnect();
        this._removeBoundEvents();
        this._removeEscapeListener();
        this._clearPendingTransition();
        this.removeTrapFocus();
        delete this.element[INSTANCE_KEY];
    }
}

/**
 * Initialize matching offcanvas and overlay elements.
 * @param {Document|Element} root - The root to initialize.
 * @return {Object} Initialized instances.
 */
function initOffcanvas(root = document) {
    const overlays = JsOffcanvasOverlay.initAll(root);
    const offcanvas = JsOffcanvas.initAll(root);

    return { offcanvas, overlays };
}

/**
 * Run a callback once the document can be queried.
 * @param {Function} callback - The callback to run.
 */
function onDocumentReady(callback) {
    if (typeof document === 'undefined') return;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
        return;
    }

    callback();
}

/**
 * Initialize existing offcanvas markup automatically.
 */
function autoInitOffcanvas() {
    if (autoInitStarted) return;

    autoInitStarted = true;
    onDocumentReady(() => {
        initOffcanvas(document);
    });
}

/**
 * Safely query for a single selector-driven element.
 * @param {string|null} selector - The CSS selector to query.
 * @param {Document|Element} context - The context in which to query.
 * @return {Element|null} The matched element.
 */
function queryOneSafe(selector, context = document) {
    if (!selector) return null;

    try {
        return context.querySelector(selector);
    } catch {
        return null;
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

autoInitOffcanvas();

export {
    OFFCANVAS_SELECTOR,
    autoInitOffcanvas,
    initOffcanvas,
    JsOffcanvasOverlay
};
export default JsOffcanvas;
