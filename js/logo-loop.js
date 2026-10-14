/**
 * LogoLoop Component (Vanilla JavaScript Implementation)
 * Based on React Bits <LogoLoop /> component.
 * Features:
 * - Seamless infinite marquee scrolling with auto copy count calculation
 * - Physics-based momentum easing on hover (smooth deceleration and resumption)
 * - Bidirectional movement ('left' and 'right')
 * - Automatic image & SVG load detection and dimensional recalculation
 * - Responsive ResizeObserver and window resize adapting
 * - Edge fadeout gradients
 */

(function (global) {
  'use strict';

  const ANIMATION_CONFIG = {
    SMOOTH_TAU: 0.25,
    MIN_COPIES: 2,
    COPY_HEADROOM: 2
  };

  class LogoLoopInstance {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      this.options = Object.assign(
        {
          speed: 80,
          direction: 'left',
          gap: 32,
          logoHeight: 28,
          pauseOnHover: true,
          hoverSpeed: undefined,
          fadeOut: true,
          fadeOutColor: '#111010',
          scaleOnHover: true,
          ariaLabel: 'Technology stack logos'
        },
        options
      );

      this.isHovered = false;
      this.raf = null;
      this.lastTimestamp = null;
      this.offset = 0;
      this.velocity = 0;
      this.seqWidth = 0;
      this.copyCount = ANIMATION_CONFIG.MIN_COPIES;

      this.effectiveHoverSpeed = this.options.hoverSpeed !== undefined
        ? this.options.hoverSpeed
        : (this.options.pauseOnHover ? 0 : undefined);

      const magnitude = Math.abs(this.options.speed);
      const directionMultiplier = this.options.direction === 'left' ? 1 : -1;
      const speedMultiplier = this.options.speed < 0 ? -1 : 1;
      this.targetVelocity = magnitude * directionMultiplier * speedMultiplier;

      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.animate = this.animate.bind(this);
      this.updateDimensions = this.updateDimensions.bind(this);

      this.setupDOM();
      this.setupEvents();
      this.updateDimensions();
      this.start();
    }

    setupDOM() {
      const opt = this.options;
      this.container.classList.add('logoloop', 'logoloop--horizontal');
      if (opt.fadeOut) this.container.classList.add('logoloop--fade');
      if (opt.scaleOnHover) this.container.classList.add('logoloop--scale-hover');

      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', opt.ariaLabel);

      this.container.style.setProperty('--logoloop-gap', `${opt.gap}px`);
      this.container.style.setProperty('--logoloop-logoHeight', `${opt.logoHeight}px`);
      if (opt.fadeOutColor) {
        this.container.style.setProperty('--logoloop-fadeColor', opt.fadeOutColor);
      }

      // Check if track already exists, or wrap children
      let track = this.container.querySelector('.logoloop__track');
      if (!track) {
        track = document.createElement('div');
        track.className = 'logoloop__track';

        // Check if there's already a logoloop__list
        let existingList = this.container.querySelector('.logoloop__list');
        if (!existingList) {
          existingList = document.createElement('ul');
          existingList.className = 'logoloop__list';
          existingList.setAttribute('role', 'list');

          // Move all existing items into this list
          while (this.container.firstChild) {
            const child = this.container.firstChild;
            if (child.nodeType === 1 && child.tagName === 'LI') {
              child.classList.add('logoloop__item');
              existingList.appendChild(child);
            } else if (child.nodeType === 1) {
              const li = document.createElement('li');
              li.className = 'logoloop__item';
              li.setAttribute('role', 'listitem');
              li.appendChild(child);
              existingList.appendChild(li);
            } else {
              this.container.removeChild(child);
            }
          }
        }

        track.appendChild(existingList);
        this.container.appendChild(track);
      }

      this.track = track;
      this.seqList = track.querySelector('.logoloop__list');

      // Tag items
      if (this.seqList) {
        this.seqList.querySelectorAll('li').forEach(li => {
          li.classList.add('logoloop__item');
          li.setAttribute('role', 'listitem');
        });
      }
    }

    setupEvents() {
      this.track.addEventListener('mouseenter', this.onMouseEnter);
      this.track.addEventListener('mouseleave', this.onMouseLeave);

      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(() => this.updateDimensions());
        this.ro.observe(this.container);
        if (this.seqList) this.ro.observe(this.seqList);
      } else {
        window.addEventListener('resize', this.updateDimensions);
      }

      // Image loaders
      const imgs = this.container.querySelectorAll('img');
      imgs.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', this.updateDimensions, { once: true });
          img.addEventListener('error', this.updateDimensions, { once: true });
        }
      });
    }

    updateDimensions() {
      if (!this.seqList || !this.track) return;

      const containerWidth = this.container.clientWidth || window.innerWidth;
      const seqRect = this.seqList.getBoundingClientRect();
      const sequenceWidth = Math.ceil(seqRect.width);

      if (sequenceWidth > 0) {
        this.seqWidth = sequenceWidth;
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
        const targetCopyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);

        if (targetCopyCount !== this.copyCount) {
          this.copyCount = targetCopyCount;
          this.rebuildCopies();
        }
      }
    }

    rebuildCopies() {
      // Remove all lists except the primary sequence template
      const lists = Array.from(this.track.querySelectorAll('.logoloop__list'));
      for (let i = 1; i < lists.length; i++) {
        lists[i].remove();
      }

      // Clone additional copies
      for (let i = 1; i < this.copyCount; i++) {
        const clone = this.seqList.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        this.track.appendChild(clone);
      }
    }

    onMouseEnter() {
      if (this.effectiveHoverSpeed !== undefined) {
        this.isHovered = true;
      }
    }

    onMouseLeave() {
      if (this.effectiveHoverSpeed !== undefined) {
        this.isHovered = false;
      }
    }

    start() {
      if (!this.raf) {
        this.lastTimestamp = null;
        this.raf = requestAnimationFrame(this.animate);
      }
    }

    stop() {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
        this.lastTimestamp = null;
      }
    }

    animate(timestamp) {
      if (this.lastTimestamp === null) {
        this.lastTimestamp = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const target = this.isHovered && this.effectiveHoverSpeed !== undefined
        ? this.effectiveHoverSpeed
        : this.targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      this.velocity += (target - this.velocity) * easingFactor;

      if (this.seqWidth > 0) {
        this.offset = ((this.offset + this.velocity * deltaTime) % this.seqWidth + this.seqWidth) % this.seqWidth;
        this.track.style.transform = `translate3d(${-this.offset}px, 0, 0)`;
      }

      this.raf = requestAnimationFrame(this.animate);
    }

    destroy() {
      this.stop();
      if (this.ro) this.ro.disconnect();
      window.removeEventListener('resize', this.updateDimensions);
      if (this.track) {
        this.track.removeEventListener('mouseenter', this.onMouseEnter);
        this.track.removeEventListener('mouseleave', this.onMouseLeave);
      }
    }
  }

  function init(container, options) {
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      return el ? new LogoLoopInstance(el, options) : null;
    }
    return new LogoLoopInstance(container, options);
  }

  function initAll(selector = '[data-logoloop="true"]') {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    elements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 70;
      const direction = el.getAttribute('data-direction') || 'left';
      const gap = parseInt(el.getAttribute('data-gap'), 10) || 28;
      const logoHeight = parseInt(el.getAttribute('data-logo-height'), 10) || 32;
      const fadeOut = el.getAttribute('data-fade-out') !== 'false';
      const fadeOutColor = el.getAttribute('data-fade-color') || '#111010';
      const scaleOnHover = el.getAttribute('data-scale-hover') !== 'false';
      const hoverSpeed = el.hasAttribute('data-hover-speed') ? parseFloat(el.getAttribute('data-hover-speed')) : 0;

      instances.push(
        new LogoLoopInstance(el, {
          speed,
          direction,
          gap,
          logoHeight,
          fadeOut,
          fadeOutColor,
          scaleOnHover,
          hoverSpeed
        })
      );
    });
    return instances;
  }

  global.LogoLoop = {
    init,
    initAll,
    Instance: LogoLoopInstance
  };
})(typeof window !== 'undefined' ? window : this);
