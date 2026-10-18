/**
 * ScrollExpand Component (Vanilla JavaScript Implementation)
 * Based on React Bits <ScrollExpand /> component.
 * 
 * Features:
 * - Expanding frame driven by page or container scroll
 * - Smooth physics-based follow damping (smoothing)
 * - Dynamic inset clip-path interpolation with radius morphing
 * - Media zoom easing back to 1:1 scale
 * - Title and scroll hint responsive fade/lift transforms
 * - Automatic overflow handling for embedded website sections
 * - Responsive ResizeObserver recalculation
 */

(function (global) {
  'use strict';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  };

  class ScrollExpandInstance {
    constructor(element, options = {}) {
      this.root = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.root) return;

      // Read data-attributes if present
      const ds = this.root.dataset;

      this.options = Object.assign(
        {
          startWidth: ds.startWidth ? parseFloat(ds.startWidth) : 48,
          startHeight: ds.startHeight ? parseFloat(ds.startHeight) : 56,
          startRadius: ds.startRadius ? parseFloat(ds.startRadius) : 24,
          endRadius: ds.endRadius ? parseFloat(ds.endRadius) : 0,
          mediaZoom: ds.mediaZoom ? parseFloat(ds.mediaZoom) : 1.12,
          scrollDistance: ds.scrollDistance ? parseFloat(ds.scrollDistance) : 1.3,
          holdDistance: ds.holdDistance ? parseFloat(ds.holdDistance) : 0.4,
          smoothing: ds.smoothing ? parseFloat(ds.smoothing) : 0.08,
          overlayScrim: ds.overlayScrim ? parseFloat(ds.overlayScrim) : 0.35,
          useWindowScroll: ds.useWindowScroll !== undefined ? ds.useWindowScroll === 'true' : true,
          enabled: ds.enabled !== undefined ? ds.enabled !== 'false' : true
        },
        options
      );

      this.track = this.root.querySelector('.scroll-expand__track');
      this.stage = this.root.querySelector('.scroll-expand__stage');
      this.frame = this.root.querySelector('.scroll-expand__frame');
      this.media = this.root.querySelector('.scroll-expand__media, .scroll-expand__content-wrapper');
      this.scrim = this.root.querySelector('.scroll-expand__scrim');
      this.title = this.root.querySelector('.scroll-expand__title');
      this.hint = this.root.querySelector('.scroll-expand__hint');
      this.overlay = this.root.querySelector('.scroll-expand__overlay');
      this.innerHeader = this.root.querySelector('.tech-expand-container .section-header');
      this.glassSurface = this.root.querySelector('.scroll-expand__glass-surface');

      if (!this.track || !this.stage || !this.frame) {
        console.warn('[ScrollExpand] Missing required sub-elements (track, stage, or frame).');
        return;
      }

      this.raf = 0;
      this.current = 0;
      this.target = 0;
      this.stageH = 0;
      this.running = false;
      this.overflowH = 0;
      this.reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.measure = this.measure.bind(this);
      this.readProgress = this.readProgress.bind(this);
      this.applyProgress = this.applyProgress.bind(this);
      this.tick = this.tick.bind(this);
      this.kick = this.kick.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);

      this.init();
    }

    init() {
      this.measure();
      this.target = this.readProgress();
      this.current = this.target;
      this.applyProgress(this.current);

      const scroller = this.options.useWindowScroll ? window : this.root;
      scroller.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize);

      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(this.onResize);
        this.ro.observe(this.root);
        if (this.media) {
          this.ro.observe(this.media);
        }
      }
    }

    measure() {
      const c = this.options;
      const isMobile = window.innerWidth <= 768;

      // Responsive adjustments for mobile screens
      this.effectiveStartWidth = isMobile ? Math.min(88, c.startWidth * 1.5) : c.startWidth;
      this.effectiveStartHeight = isMobile ? Math.min(58, c.startHeight * 1.1) : c.startHeight;

      this.stageH = c.useWindowScroll ? window.innerHeight : this.root.clientHeight;
      if (this.stageH <= 0) return;

      this.stage.style.height = `${this.stageH}px`;

      // Check if media/content inside is taller than stage
      if (this.media) {
        const contentH = this.media.scrollHeight || this.media.offsetHeight;
        this.overflowH = Math.max(0, contentH - this.stageH + 60);
      } else {
        this.overflowH = 0;
      }

      // Track height accounts for stage height + scroll distance + hold distance + any overflow scroll
      const expansionSpan = this.stageH * Math.max(0.01, c.scrollDistance);
      const holdSpan = this.stageH * Math.max(0, c.holdDistance) + this.overflowH;
      const totalTrackH = this.stageH + expansionSpan + holdSpan;

      this.track.style.height = `${totalTrackH}px`;

      const w = this.root.clientWidth || this.stageH;
      this.stage.style.setProperty('--se-title-size', `${clamp(w * 0.055, 24, 72)}px`);
    }

    readProgress() {
      const c = this.options;
      if (!c.enabled) return 1;

      const span = this.stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const rect = this.track.getBoundingClientRect();
        // Progress goes from 0 when track top hits viewport top to 1 when scrolled by `span`
        return clamp(-rect.top / span, 0, 1);
      }
      return clamp(this.root.scrollTop / span, 0, 1);
    }

    readHoldProgress() {
      // Progress of scrolling through the hold zone (after expansion)
      const c = this.options;
      const span = this.stageH * Math.max(0.01, c.scrollDistance);
      const holdSpan = this.stageH * Math.max(0, c.holdDistance) + this.overflowH;
      if (holdSpan <= 0) return 0;

      if (c.useWindowScroll) {
        const rect = this.track.getBoundingClientRect();
        const pastSpan = -rect.top - span;
        return clamp(pastSpan / holdSpan, 0, 1);
      }
      return 0;
    }

    applyProgress(p) {
      const frame = this.frame;
      const media = this.media;
      if (!frame) return;
      const c = this.options;

      const e = smoothstep(0, 1, p);

      const w = this.effectiveStartWidth + (100 - this.effectiveStartWidth) * e;
      const h = this.effectiveStartHeight + (100 - this.effectiveStartHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const r = c.startRadius + (c.endRadius - c.startRadius) * e;

      frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

      // Frame styling: border & shadow fade away as it reaches 100% full bleed
      if (e >= 0.99) {
        frame.classList.add('scroll-expand__frame--expanded');
        frame.style.boxShadow = 'none';
      } else {
        frame.classList.remove('scroll-expand__frame--expanded');
        const glowOpacity = (1 - e);
        frame.style.boxShadow = `0 24px 60px -12px rgba(0, 0, 0, ${0.95 * glowOpacity}), 0 0 35px rgba(0, 240, 255, ${0.2 * glowOpacity}), inset 0 1px 0 rgba(0, 240, 255, ${0.4 * glowOpacity})`;
      }

      // Handle media zoom or content translation
      if (media) {
        if (p < 1 || this.overflowH <= 0) {
          const zoom = c.mediaZoom + (1 - c.mediaZoom) * e;
          media.style.transform = `scale(${zoom})`;
        } else {
          // If frame is fully expanded and content has overflow, smoothly scroll through overflow
          const holdP = this.readHoldProgress();
          const translateY = -this.overflowH * holdP;
          media.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }
      }

      // Inner header fades in gracefully only as the resting title lifts away
      if (this.innerHeader) {
        const headerIn = smoothstep(0.6, 0.95, p);
        this.innerHeader.style.opacity = `${headerIn}`;
        this.innerHeader.style.transform = `translate3d(0, ${(1 - headerIn) * 20}px, 0)`;
        this.innerHeader.style.visibility = headerIn > 0.01 ? 'visible' : 'hidden';
      }

      
      // Frosted GlassSurface fades out smoothly upon zooming in, and fades back in upon zooming out
      if (this.glassSurface) {
        const glassFade = smoothstep(0, 0.72, p);
        const glassOpacity = 1 - glassFade;
        this.glassSurface.style.opacity = `${glassOpacity}`;
        this.glassSurface.style.visibility = glassOpacity <= 0.005 ? 'hidden' : 'visible';
      }

      if (this.scrim) {
        // Scrim is visible at rest to emphasize preview and fades to 0
        this.scrim.style.opacity = `${c.overlayScrim * (1 - e)}`;
      }

      if (this.title) {
        const out = smoothstep(0.2, 0.72, p);
        this.title.style.opacity = `${1 - out}`;
        this.title.style.transform = `translate3d(0, ${-36 * out}px, 0) scale(${1 + 0.05 * out})`;
        this.title.style.pointerEvents = out > 0.7 ? 'none' : 'auto';
        this.title.style.visibility = out >= 1 ? 'hidden' : 'visible';
      }

      if (this.hint) {
        const gone = smoothstep(0, 0.12, p);
        this.hint.style.opacity = `${1 - gone}`;
        this.hint.style.transform = `translate3d(0, ${12 * gone}px, 0)`;
        this.hint.style.visibility = gone >= 0.95 ? 'hidden' : 'visible';
        this.hint.style.pointerEvents = 'none';
      }

      if (this.overlay) {
        const inn = smoothstep(0.68, 1, p);
        this.overlay.style.opacity = `${inn}`;
        this.overlay.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
      }
    }

    tick() {
      const c = this.options;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      this.current += (this.target - this.current) * k;

      if (Math.abs(this.target - this.current) < 0.0004) {
        this.current = this.target;
        this.running = false;
      }

      this.applyProgress(this.current);
      this.raf = this.running ? requestAnimationFrame(this.tick) : 0;
    }

    kick() {
      if (this.running) return;
      this.running = true;
      if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    }

    onScroll() {
      this.target = this.readProgress();
      if (this.options.smoothing <= 0 || this.reduceMotion) {
        this.current = this.target;
        this.applyProgress(this.current);
        return;
      }
      this.kick();
    }

    onResize() {
      this.measure();
      this.target = this.readProgress();
      this.current = this.target;
      this.applyProgress(this.current);
    }

    destroy() {
      if (this.raf) cancelAnimationFrame(this.raf);
      const scroller = this.options.useWindowScroll ? window : this.root;
      scroller.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      if (this.ro) this.ro.disconnect();
    }
  }

  // Auto-init on DOMContentLoaded
  function initAllScrollExpand() {
    const nodes = document.querySelectorAll('[data-scroll-expand="true"], .scroll-expand');
    nodes.forEach(node => {
      if (!node._scrollExpandInstance) {
        node._scrollExpandInstance = new ScrollExpandInstance(node);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllScrollExpand);
  } else {
    initAllScrollExpand();
  }

  global.ScrollExpand = ScrollExpandInstance;
  global.initAllScrollExpand = initAllScrollExpand;

})(typeof window !== 'undefined' ? window : this);
