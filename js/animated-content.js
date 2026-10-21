/**
 * AnimatedContent - Vanilla JS Runtime (React Bits Integration)
 * High-performance GSAP ScrollTrigger physics reveal & entrance animator.
 *
 * Supports all React Bits props via data attributes:
 * - data-animated-content="true"
 * - data-distance="60"
 * - data-direction="vertical|horizontal"
 * - data-reverse="true|false"
 * - data-duration="0.8"
 * - data-ease="power3.out"
 * - data-initial-opacity="0"
 * - data-scale="0.95"
 * - data-blur="10"
 * - data-rotate="0"
 * - data-tilt="0"
 * - data-wipe="none|up|down|left|right|center"
 * - data-threshold="0.1"
 * - data-delay="0"
 * - data-stagger="0.08"
 * - data-stagger-from="start|end|center|edges|random"
 * - data-trigger="scroll|mount"
 * - data-once="true|false"
 */

(function (global) {
  'use strict';

  const WIPES = {
    up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    center:
      'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
  };

  class AnimatedContentInstance {
    constructor(element, options = {}) {
      this.el = element;
      if (!this.el || this.el._animatedContentInstance) return;
      this.el._animatedContentInstance = this;

      const ds = element.dataset || {};

      this.distance = options.distance ?? (ds.distance !== undefined ? parseFloat(ds.distance) : 60);
      this.direction = options.direction || ds.direction || 'vertical';
      this.reverse = options.reverse ?? (ds.reverse === 'true');
      this.duration = options.duration ?? (ds.duration !== undefined ? parseFloat(ds.duration) : 0.8);
      this.ease = options.ease || ds.ease || 'power3.out';
      this.initialOpacity = options.initialOpacity ?? (ds.initialOpacity !== undefined ? parseFloat(ds.initialOpacity) : 0);
      this.animateOpacity = options.animateOpacity ?? (ds.animateOpacity !== 'false');
      this.scale = options.scale ?? (ds.scale !== undefined ? parseFloat(ds.scale) : 1);
      this.blur = options.blur ?? (ds.blur !== undefined ? parseFloat(ds.blur) : 0);
      this.rotate = options.rotate ?? (ds.rotate !== undefined ? parseFloat(ds.rotate) : 0);
      this.tilt = options.tilt ?? (ds.tilt !== undefined ? parseFloat(ds.tilt) : 0);
      this.wipe = options.wipe || ds.wipe || 'none';
      this.threshold = options.threshold ?? (ds.threshold !== undefined ? parseFloat(ds.threshold) : 0.12);
      this.delay = options.delay ?? (ds.delay !== undefined ? parseFloat(ds.delay) : 0);
      this.stagger = options.stagger ?? (ds.stagger !== undefined ? parseFloat(ds.stagger) : 0);
      this.staggerFrom = options.staggerFrom || ds.staggerFrom || 'start';
      this.trigger = options.trigger || ds.trigger || 'scroll';
      this.once = options.once ?? (ds.once !== 'false');
      this.scrub = options.scrub ?? (ds.scrub === 'true' ? true : ds.scrub ? parseFloat(ds.scrub) : false);
      this.container = options.container || ds.container || null;

      this.init();
    }

    init() {
      const gsap = global.gsap;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

      if (!gsap || reduce) {
        this.el.style.visibility = 'visible';
        this.el.style.opacity = '1';
        return;
      }

      if (global.ScrollTrigger && !gsap.plugins?.scrollTrigger) {
        gsap.registerPlugin(global.ScrollTrigger);
      }

      let scroller = this.container || null;
      if (typeof scroller === 'string') scroller = document.querySelector(scroller);

      const targets = this.stagger > 0 && this.el.children.length > 0 ? Array.from(this.el.children) : [this.el];
      const horizontal = this.direction === 'horizontal';
      const axis = horizontal ? 'x' : 'y';
      const sign = this.reverse ? -1 : 1;
      const mask = WIPES[this.wipe];

      gsap.set(this.el, { visibility: 'visible' });

      const from = {
        [axis]: this.distance * sign,
        scale: this.scale,
        opacity: this.animateOpacity ? this.initialOpacity : 1
      };

      const to = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration: this.duration,
        ease: this.ease
      };

      if (this.blur > 0) {
        from.filter = `blur(${this.blur}px)`;
        to.filter = 'blur(0px)';
      }

      if (this.rotate) {
        from.rotation = this.rotate * sign;
        to.rotation = 0;
      }

      if (this.tilt) {
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
        from[tiltAxis] = horizontal ? -this.tilt * sign : this.tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }

      if (mask) {
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from['--ac-wipe'] = 0;
        to['--ac-wipe'] = 1;
      }

      if (this.stagger > 0) {
        to.stagger = { each: this.stagger, from: this.staggerFrom };
      }

      const settle = () => {
        if (this.scrub) return;
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });
      };

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          settle();
        }
      });

      tl.fromTo(targets, from, to, this.scrub ? 0 : Math.max(this.delay, 0));

      if (this.trigger === 'mount') {
        tl.play();
        return;
      }

      // If ScrollTrigger is available
      if (global.ScrollTrigger) {
        const start = `top ${(1 - this.threshold) * 100}%`;

        if (this.scrub) {
          global.ScrollTrigger.create({
            trigger: this.el,
            scroller,
            start,
            end: `top ${Math.max((1 - this.threshold) * 100 - 45, 5)}%`,
            scrub: this.scrub === true ? true : Math.max(Number(this.scrub) || 0, 0.01),
            animation: tl
          });
          return;
        }

        global.ScrollTrigger.create({
          trigger: this.el,
          scroller,
          start,
          once: this.once,
          onEnter: () => tl.play(),
          onLeaveBack: this.once
            ? undefined
            : () => {
                if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
                tl.reverse();
              }
        });
      } else {
        // Fallback with IntersectionObserver if ScrollTrigger plugin script is still loading
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              tl.play();
              if (this.once) obs.unobserve(entry.target);
            } else if (!this.once) {
              tl.reverse();
            }
          });
        }, { threshold: this.threshold });

        observer.observe(this.el);
      }
    }
  }

  function initAllAnimatedContent() {
    const elements = document.querySelectorAll('[data-animated-content="true"], .animated-content');
    elements.forEach(el => {
      if (!el._animatedContentInstance) {
        new AnimatedContentInstance(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimatedContent);
  } else {
    // Small timeout to allow other scripts / GSAP to be fully evaluated
    setTimeout(initAllAnimatedContent, 30);
  }

  global.AnimatedContent = {
    init: initAllAnimatedContent,
    create: (el, opts) => new AnimatedContentInstance(el, opts)
  };

})(typeof window !== 'undefined' ? window : this);
