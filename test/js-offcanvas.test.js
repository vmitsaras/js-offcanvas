import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JsOffcanvas, { initOffcanvas } from '../src/js-offcanvas.js';
import JsOffcanvasOverlay from '../src/js-offcanvas-overlay.js';

describe('js-offcanvas', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function setup() {
    const trigger = document.createElement('button');
    trigger.id = 'trigger';
    trigger.textContent = 'Open';

    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.className = 'js-offcanvas-overlay';
    overlay.setAttribute('data-offcanvas-overlay', '');

    const offcanvas = document.createElement('aside');
    offcanvas.className = 'js-offcanvas';
    offcanvas.setAttribute('data-offcanvas', '');
    offcanvas.setAttribute('button-selector', '#trigger');
    offcanvas.setAttribute('overlay-selector', '#overlay');
    offcanvas.innerHTML = '<button data-offcanvas-close>Close</button>';

    document.body.append(trigger, overlay, offcanvas);
    JsOffcanvasOverlay.initAll();
    JsOffcanvas.initAll();

    return { trigger, overlay, offcanvas, instance: offcanvas.jsOffcanvas };
  }

  it('initializes as hidden and applies dialog semantics', () => {
    const { offcanvas, trigger } = setup();

    expect(offcanvas.isHidden).toBe(true);
    expect(offcanvas.getAttribute('role')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('preserves existing role and tabindex semantics', () => {
    const trigger = document.createElement('button');
    trigger.id = 'trigger';

    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.className = 'js-offcanvas-overlay';
    overlay.setAttribute('data-offcanvas-overlay', '');

    const offcanvas = document.createElement('aside');
    offcanvas.className = 'js-offcanvas';
    offcanvas.setAttribute('data-offcanvas', '');
    offcanvas.setAttribute('button-selector', '#trigger');
    offcanvas.setAttribute('overlay-selector', '#overlay');
    offcanvas.setAttribute('role', 'complementary');
    offcanvas.setAttribute('tabindex', '-2');

    document.body.append(trigger, overlay, offcanvas);
    JsOffcanvasOverlay.initAll();
    JsOffcanvas.initAll();

    expect(offcanvas.getAttribute('role')).toBe('complementary');
    expect(offcanvas.getAttribute('tabindex')).toBe('-2');

    offcanvas.open();
    offcanvas.close();

    expect(offcanvas.getAttribute('tabindex')).toBe('-2');
  });

  it('removes the temporary tabindex when none was provided by the author', () => {
    const { offcanvas } = setup();

    expect(offcanvas.getAttribute('tabindex')).toBe('-1');

    offcanvas.open();
    offcanvas.close();

    expect(offcanvas.hasAttribute('tabindex')).toBe(false);
  });

  it('initializes offcanvas and overlay markup through the package entrypoint', () => {
    const trigger = document.createElement('button');
    trigger.id = 'entry-trigger';

    const overlay = document.createElement('div');
    overlay.className = 'js-offcanvas-overlay';

    const offcanvas = document.createElement('aside');
    offcanvas.className = 'js-offcanvas';
    offcanvas.setAttribute('button-selector', '#entry-trigger');
    offcanvas.setAttribute('overlay-selector', '.js-offcanvas-overlay');

    document.body.append(trigger, overlay, offcanvas);

    const initialized = initOffcanvas();

    expect(initialized.offcanvas).toHaveLength(1);
    expect(initialized.overlays).toHaveLength(1);
    expect(offcanvas.jsOffcanvas).toBeInstanceOf(JsOffcanvas);
    expect(overlay.jsOffcanvasOverlay).toBeInstanceOf(JsOffcanvasOverlay);
  });

  it('opens and closes via public methods', () => {
    const { offcanvas, overlay, trigger } = setup();

    offcanvas.open();

    expect(offcanvas.isHidden).toBe(false);
    expect(offcanvas.hasAttribute('open')).toBe(true);
    expect(offcanvas.getAttribute('aria-modal')).toBe('true');
    expect(overlay.hasAttribute('open')).toBe(true);
    expect(overlay.getAttribute('aria-hidden')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    offcanvas.close();

    expect(offcanvas.isHidden).toBe(true);
    expect(offcanvas.hasAttribute('open')).toBe(false);
    expect(offcanvas.hasAttribute('aria-modal')).toBe(false);
    expect(overlay.hasAttribute('open')).toBe(false);
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets a fallback trigger aria-label based on panel position', () => {
    const { offcanvas, trigger } = setup();
    trigger.removeAttribute('aria-label');
    offcanvas.setAttribute('position', 'right');
    offcanvas.append(document.createElement('p'));

    offcanvas.jsOffcanvas.setTriggerExpanded(true);

    expect(trigger.getAttribute('aria-label')).toBe('Toggle right panel');
  });

  it('toggles on trigger click', () => {
    const { offcanvas, trigger } = setup();

    trigger.click();
    expect(offcanvas.isHidden).toBe(false);

    trigger.click();
    expect(offcanvas.isHidden).toBe(true);
  });

  it('does not duplicate trigger keydown listeners after re-initializing', async () => {
    const { offcanvas, trigger } = setup();
    const initSpy = vi.fn();

    offcanvas.addEventListener('init', initSpy);
    offcanvas.append(document.createElement('p'));
    await Promise.resolve();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(offcanvas.isHidden).toBe(false);
  });

  it('preserves open state when child mutations re-initialize the component', async () => {
    const { offcanvas, overlay, trigger } = setup();

    offcanvas.open();
    offcanvas.append(document.createElement('p'));
    await Promise.resolve();

    expect(offcanvas.isHidden).toBe(false);
    expect(offcanvas.hasAttribute('open')).toBe(true);
    expect(offcanvas.getAttribute('aria-modal')).toBe('true');
    expect(overlay.hasAttribute('open')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('moves direct trigger listeners when the trigger selector changes before re-initializing', async () => {
    const { offcanvas, trigger } = setup();
    const nextTrigger = document.createElement('button');
    nextTrigger.id = 'next-trigger';
    document.body.prepend(nextTrigger);

    offcanvas.setAttribute('button-selector', '#next-trigger');
    offcanvas.append(document.createElement('p'));
    await Promise.resolve();

    trigger.click();
    expect(offcanvas.isHidden).toBe(true);

    nextTrigger.click();
    expect(offcanvas.isHidden).toBe(false);
  });

  it('closes only once when the overlay is clicked', () => {
    const { offcanvas, overlay, instance } = setup();
    const closeSpy = vi.spyOn(instance, 'close');

    offcanvas.open();
    overlay.click();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('registers and removes document escape listeners on open/close cycles', () => {
    const { offcanvas, instance } = setup();
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    offcanvas.open();
    offcanvas.close();
    offcanvas.open();
    offcanvas.close();

    const addedEscape = addSpy.mock.calls.filter(
      ([type, handler]) => type === 'keydown' && handler === instance._documentKeydownFn
    );
    const removedEscape = removeSpy.mock.calls.filter(
      ([type, handler]) => type === 'keydown' && handler === instance._documentKeydownFn
    );

    expect(addedEscape.length).toBe(2);
    expect(removedEscape.length).toBe(2);
  });

  it('ignores invalid selector attributes without throwing', () => {
    const offcanvas = document.createElement('aside');
    offcanvas.className = 'js-offcanvas';
    offcanvas.setAttribute('data-offcanvas', '');
    offcanvas.setAttribute('button-selector', '[');
    offcanvas.setAttribute('overlay-selector', '[');
    offcanvas.setAttribute('inert-selector', '[');
    offcanvas.innerHTML = '<button data-offcanvas-close>Close</button>';
    document.body.append(offcanvas);

    expect(() => new JsOffcanvas(offcanvas)).not.toThrow();
    expect(() => offcanvas.open()).not.toThrow();
    expect(offcanvas.isHidden).toBe(false);
  });

  it('closes on Escape when open', () => {
    const { offcanvas } = setup();
    offcanvas.open();

    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(esc);

    expect(offcanvas.isHidden).toBe(true);
  });

  it('does not close on Escape while a form control is focused', () => {
    const { offcanvas } = setup();
    const input = document.createElement('input');
    offcanvas.append(input);

    offcanvas.open();
    input.focus();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(offcanvas.isHidden).toBe(false);
  });

  it.each([
    {
      label: 'textarea',
      createControl: () => {
        const element = document.createElement('textarea');
        return element;
      }
    },
    {
      label: 'select',
      createControl: () => {
        const element = document.createElement('select');
        element.append(document.createElement('option'));
        return element;
      }
    }
  ])('does not close on Escape while $label is focused', ({ createControl }) => {
    const { offcanvas } = setup();
    const control = createControl();
    offcanvas.append(control);

    offcanvas.open();
    control.focus();

    control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(offcanvas.isHidden).toBe(false);
  });

  it('is idempotent when opened repeatedly', () => {
    const { offcanvas } = setup();
    const beforeOpen = vi.fn();
    const onOpen = vi.fn();

    offcanvas.addEventListener('beforeopen', beforeOpen);
    offcanvas.addEventListener('open', onOpen);

    offcanvas.open();
    offcanvas.open();

    expect(beforeOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(offcanvas.isHidden).toBe(false);
  });

  it('is idempotent when closed repeatedly', () => {
    const { offcanvas } = setup();
    const beforeClose = vi.fn();
    const onClose = vi.fn();

    offcanvas.addEventListener('beforeclose', beforeClose);
    offcanvas.addEventListener('close', onClose);

    offcanvas.open();
    offcanvas.close();
    offcanvas.close();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(offcanvas.isHidden).toBe(true);
  });

  it('warns once when deprecated btnExpandend is used', () => {
    const { offcanvas } = setup();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    offcanvas.btnExpandend(true);
    offcanvas.btnExpandend(false);

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('prioritizes [autofocus] over [data-autofocus]', () => {
    const { offcanvas } = setup();
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb();
      return 0;
    });

    const dataAutofocus = document.createElement('button');
    dataAutofocus.setAttribute('data-autofocus', '');

    const autofocus = document.createElement('button');
    autofocus.setAttribute('autofocus', '');

    offcanvas.innerHTML = '';
    offcanvas.append(dataAutofocus, autofocus);

    const autofocusSpy = vi.spyOn(autofocus, 'focus');
    const dataAutofocusSpy = vi.spyOn(dataAutofocus, 'focus');

    offcanvas.open();

    expect(autofocusSpy).toHaveBeenCalledTimes(1);
    expect(dataAutofocusSpy).not.toHaveBeenCalled();

    rafSpy.mockRestore();
  });

  it('applies inert only to elements matching custom inert-selector', () => {
    const { offcanvas, instance } = setup();
    const outside = document.createElement('div');
    outside.className = 'outside-target';
    outside.inert = false;

    const nonTarget = document.createElement('div');
    nonTarget.className = 'non-target';

    instance._supportsInert = true;
    offcanvas.setAttribute('inert-selector', '.outside-target');
    document.body.append(outside, nonTarget);

    offcanvas.open();
    expect(outside.inert).toBe(true);
    expect(nonTarget.inert).not.toBe(true);

    offcanvas.close();
    expect(outside.inert).toBe(false);
  });

  it('restores pre-existing inert state after closing', () => {
    const { offcanvas, instance } = setup();
    const outside = document.createElement('div');
    outside.className = 'outside-target';
    outside.inert = true;

    instance._supportsInert = true;
    offcanvas.setAttribute('inert-selector', '.outside-target');
    document.body.append(outside);

    offcanvas.open();
    offcanvas.close();

    expect(outside.inert).toBe(true);
  });

  it('removes trap focus before restoring focus after close', () => {
    const { offcanvas, instance } = setup();
    const order = [];

    vi.spyOn(instance, 'removeTrapFocus').mockImplementation(() => {
      order.push('removeTrapFocus');
    });

    vi.spyOn(instance, '_restoreFocusAfterClose').mockImplementation(() => {
      order.push('restoreFocus');
    });

    offcanvas.open();
    offcanvas.close();

    expect(order).toEqual(['removeTrapFocus', 'restoreFocus']);
  });

  it('keeps the Tab focus loop active when inert is supported', () => {
    const { offcanvas, instance } = setup();
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    const first = document.createElement('button');
    const last = document.createElement('button');
    first.setAttribute('tabindex', '0');
    last.setAttribute('tabindex', '0');
    offcanvas.innerHTML = '';
    offcanvas.append(first, last);
    instance._supportsInert = true;

    offcanvas.open();
    const lastFocusSpy = vi.spyOn(last, 'focus');
    offcanvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));

    expect(lastFocusSpy).toHaveBeenCalledTimes(1);
    rafSpy.mockRestore();
  });

  it('excludes negative tabindex values from the focusable element list', () => {
    const { offcanvas, instance } = setup();
    const first = document.createElement('button');
    const hiddenByTabindex = document.createElement('button');
    const last = document.createElement('button');

    hiddenByTabindex.setAttribute('tabindex', '-2');
    offcanvas.innerHTML = '';
    offcanvas.append(first, hiddenByTabindex, last);

    const focusable = instance._getFocusableElements();

    expect(focusable).toContain(first);
    expect(focusable).toContain(last);
    expect(focusable).not.toContain(hiddenByTabindex);
  });

  it('wraps focus with Tab and Shift+Tab while skipping negative tabindex elements', () => {
    const { offcanvas } = setup();
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    const first = document.createElement('button');
    const hiddenByTabindex = document.createElement('button');
    const last = document.createElement('button');

    hiddenByTabindex.setAttribute('tabindex', '-3');
    offcanvas.innerHTML = '';
    offcanvas.append(first, hiddenByTabindex, last);

    offcanvas.open();

    last.focus();
    offcanvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    offcanvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);

    rafSpy.mockRestore();
  });

  it('ignores bubbled child transitionend events while opening', () => {
    const { offcanvas } = setup();
    const openSpy = vi.fn();
    const child = document.createElement('div');
    offcanvas.append(child);
    offcanvas.style.transitionDuration = '1s';
    offcanvas.addEventListener('open', openSpy);

    offcanvas.open();
    child.dispatchEvent(new Event('transitionend', { bubbles: true }));
    expect(openSpy).not.toHaveBeenCalled();

    offcanvas.dispatchEvent(new Event('transitionend'));
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('allows beforeopen and beforeclose to cancel state changes', () => {
    const { offcanvas } = setup();

    offcanvas.addEventListener('beforeopen', event => event.preventDefault(), { once: true });
    offcanvas.open();
    expect(offcanvas.isHidden).toBe(true);

    offcanvas.open();
    offcanvas.addEventListener('beforeclose', event => event.preventDefault(), { once: true });
    offcanvas.close();
    expect(offcanvas.isHidden).toBe(false);
  });

  it('handles Tab with no focusable children without throwing', () => {
    const { offcanvas } = setup();
    offcanvas.innerHTML = '<div>content only</div>';

    offcanvas.open();

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    expect(() => offcanvas.dispatchEvent(tabEvent)).not.toThrow();
    expect(offcanvas.isHidden).toBe(false);
  });

  it('dispatches lifecycle events', () => {
    const { offcanvas } = setup();
    const beforeOpen = vi.fn();
    const onOpen = vi.fn();
    const beforeClose = vi.fn();
    const onClose = vi.fn();

    offcanvas.addEventListener('beforeopen', beforeOpen);
    offcanvas.addEventListener('open', onOpen);
    offcanvas.addEventListener('beforeclose', beforeClose);
    offcanvas.addEventListener('close', onClose);

    offcanvas.open();
    offcanvas.close();

    expect(beforeOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cleans up listeners and instance references on destroy', () => {
    const { offcanvas, overlay, trigger, instance } = setup();
    const disconnectSpy = vi.spyOn(instance._observer, 'disconnect');
    const outside = document.createElement('div');
    outside.className = 'outside-target';
    outside.inert = false;
    offcanvas.setAttribute('inert-selector', '.outside-target');
    instance._supportsInert = true;
    document.body.append(outside);

    offcanvas.open();
    const beforeDestroyIsHidden = offcanvas.isHidden;
    const beforeDestroyOpenAttribute = offcanvas.hasAttribute('open');
    const beforeDestroyAriaModal = offcanvas.getAttribute('aria-modal');
    const beforeDestroyOverlayOpenAttribute = overlay.hasAttribute('open');
    const beforeDestroyOverlayAriaHidden = overlay.getAttribute('aria-hidden');
    const beforeDestroyTriggerExpanded = trigger.getAttribute('aria-expanded');

    offcanvas.destroy();
    trigger.click();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(offcanvas.jsOffcanvas).toBeUndefined();
    expect(offcanvas.isHidden).toBe(beforeDestroyIsHidden);
    expect(offcanvas.hasAttribute('open')).toBe(beforeDestroyOpenAttribute);
    expect(offcanvas.getAttribute('aria-modal')).toBe(beforeDestroyAriaModal);
    expect(overlay.hasAttribute('open')).toBe(beforeDestroyOverlayOpenAttribute);
    expect(overlay.getAttribute('aria-hidden')).toBe(beforeDestroyOverlayAriaHidden);
    expect(trigger.getAttribute('aria-expanded')).toBe(beforeDestroyTriggerExpanded);
    expect(outside.inert).toBe(false);
  });
});
