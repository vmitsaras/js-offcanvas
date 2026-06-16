import JsOffcanvas from '../src/js-offcanvas.js';
import { gsap } from '../node_modules/gsap/index.js';

const drawer = document.querySelector('#creativeMenu');
const triggers = document.querySelectorAll('.js-creative-menu-trigger, .js-creative-menu-open');
const extraOpenButtons = document.querySelectorAll('.js-creative-menu-open');
const drawerLinks = document.querySelectorAll('.drawer-link');
const tidePath = document.querySelector('.menu-tide-path');
const orbitMap = document.querySelector('.orbit-map');
const orbitRoute = document.querySelector('.orbit-route');
const orbitSpark = document.querySelector('.orbit-spark');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tideClosed = 'M0 0 H520 V820 H0 C84 704 84 598 30 493 C-28 380 2 271 76 192 C127 139 131 59 0 0 Z';
const tideOpen = 'M0 0 H520 V820 H0 C182 706 116 592 198 493 C286 388 129 292 214 189 C278 111 194 45 0 0 Z';

function setTriggerState(isOpen) {
    triggers.forEach(trigger => {
        trigger.classList.toggle('is-open', isOpen);
    });
}

function animateTrigger(isOpen) {
    if (!gsap || reducedMotion) {
        setTriggerState(isOpen);
        return;
    }

    setTriggerState(isOpen);

    triggers.forEach(trigger => {
        const topLine = trigger.querySelector('.menu-line-top');
        const middleLine = trigger.querySelector('.menu-line-middle');
        const bottomLine = trigger.querySelector('.menu-line-bottom');

        if (!topLine || !middleLine || !bottomLine) return;

        gsap.to(topLine, {
            attr: { d: isOpen ? 'M14 14 L30 30' : 'M12 16 H32' },
            duration: 0.28,
            ease: 'power2.out'
        });
        gsap.to(middleLine, {
            opacity: isOpen ? 0 : 1,
            scaleX: isOpen ? 0.25 : 1,
            transformOrigin: 'center',
            duration: 0.2,
            ease: 'power2.out'
        });
        gsap.to(bottomLine, {
            attr: { d: isOpen ? 'M30 14 L14 30' : 'M12 28 H32' },
            duration: 0.28,
            ease: 'power2.out'
        });
    });
}

function openChoreography() {
    animateTrigger(true);

    if (!gsap || reducedMotion) return;

    requestAnimationFrame(() => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        timeline
            .fromTo(tidePath, { attr: { d: tideClosed } }, { attr: { d: tideOpen }, duration: 0.82 }, 0)
            .fromTo('.creative-menu .eyebrow', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.36 }, 0.16)
            .fromTo('.creative-menu h2', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.22)
            .fromTo(drawerLinks, { autoAlpha: 0, x: 34 }, { autoAlpha: 1, x: 0, stagger: 0.075, duration: 0.48 }, 0.32)
            .fromTo('.drawer-note', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.62);
    });
}

function closeChoreography() {
    animateTrigger(false);

    if (!gsap || reducedMotion) return;

    gsap.to(tidePath, {
        attr: { d: tideClosed },
        duration: 0.45,
        ease: 'power2.inOut'
    });
    gsap.to(drawerLinks, {
        autoAlpha: 0,
        x: 24,
        stagger: { each: 0.035, from: 'end' },
        duration: 0.2,
        ease: 'power2.in'
    });
}

if (drawer) {
    drawer.addEventListener('beforeopen', openChoreography);
    drawer.addEventListener('beforeclose', closeChoreography);
    drawer.addEventListener('close', () => {
        animateTrigger(false);
    });

    extraOpenButtons.forEach(button => {
        button.addEventListener('click', () => {
            const instance = JsOffcanvas.getInstance(drawer) || new JsOffcanvas(drawer);

            instance.open();
        });
    });
}

if (gsap && !reducedMotion) {
    gsap.set(drawerLinks, { autoAlpha: 0, x: 34 });
    gsap.set(['.creative-menu .eyebrow', '.creative-menu h2', '.drawer-note'], { autoAlpha: 0, y: 18 });

    gsap.to(orbitRoute, {
        strokeDashoffset: -140,
        duration: 8,
        repeat: -1,
        ease: 'none'
    });
    gsap.to(orbitSpark, {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 22,
        repeat: -1,
        ease: 'none'
    });
    gsap.fromTo(orbitMap, {
        y: 10,
        rotate: -1.5
    }, {
        y: -10,
        rotate: 1.5,
        duration: 4.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
    });
}
