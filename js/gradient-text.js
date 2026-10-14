/**
 * GradientText - Vanilla JS Runtime (React Bits Integration)
 * High-performance animated text gradient with liquid flow, conic & linear modes,
 * spring-physics pointer tracking, and ambient glow bloom.
 */
(function() {
  'use strict';

  const VARIANTS = ['linear', 'flow', 'conic'];
  const ANGLES = { horizontal: 90, vertical: 180, diagonal: 135 };
  const TAU = Math.PI * 2;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  class GradientTextInstance {
    constructor(root, options = {}) {
      this.root = root;
      if (!this.root || this.root._gtInstance) return;
      this.root._gtInstance = this;

      // Extract configurations from options or dataset
      const ds = root.dataset || {};
      let colors = options.colors;
      if (!colors && ds.colors) {
        colors = ds.colors.split(',').map(c => c.trim()).filter(Boolean);
      }
      if (!colors || colors.length === 0) {
        colors = ['#7fa8ff', '#edeae4', '#38bdf8', '#a78bfa', '#7fa8ff'];
      }
      this.darkPalette = colors.length > 1 ? colors : [colors[0] || '#ffffff', colors[0] || '#ffffff'];

      let lightColors = options.colorsLight;
      if (!lightColors && ds.colorsLight) {
        lightColors = ds.colorsLight.split(',').map(c => c.trim()).filter(Boolean);
      }
      if (!lightColors || lightColors.length === 0) {
        lightColors = ['#1d4ed8', '#0f172a', '#0284c7', '#6d28d9', '#1d4ed8'];
      }
      this.lightPalette = lightColors.length > 1 ? lightColors : [lightColors[0] || '#0f172a', lightColors[0] || '#0f172a'];

      this.isLight = document.documentElement.getAttribute('data-theme') === 'light';
      this.palette = this.isLight ? this.lightPalette : this.darkPalette;

      const animationSpeed = options.animationSpeed ?? (ds.speed ? parseFloat(ds.speed) : (ds.animationSpeed ? parseFloat(ds.animationSpeed) : 8));
      const variant = options.variant || ds.variant || 'linear';
      const angle = options.angle ?? (ds.angle ? parseFloat(ds.angle) : 90);
      const direction = options.direction || ds.direction;
      const scale = options.scale ?? (ds.scale ? parseFloat(ds.scale) : 3);
      const yoyo = options.yoyo !== undefined ? options.yoyo : (ds.yoyo !== undefined ? ds.yoyo !== 'false' : true);
      const glow = options.glow ?? (ds.glow ? parseFloat(ds.glow) : 0);
      const borderWidth = options.borderWidth ?? (ds.borderWidth ? parseFloat(ds.borderWidth) : 1.5);
      const pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : (ds.pauseOnHover === 'true');
      const followPointer = options.followPointer !== undefined ? options.followPointer : (ds.followPointer !== 'false');

      this.settings = {
        colors: this.palette,
        speed: Math.max(0.2, animationSpeed),
        variant: VARIANTS.includes(variant) ? variant : 'linear',
        angle: direction ? (ANGLES[direction] ?? angle) : angle,
        scale: clamp(scale, 1, 6),
        yoyo,
        glow: clamp(glow, 0, 1),
        borderWidth,
        pauseOnHover,
        followPointer
      };

      this.state = {
        time: 0,
        inside: false,
        visible: true,
        x: 0.5,
        y: 0.5,
        px: 0.5,
        py: 0.5,
        vx: 0,
        vy: 0,
        pull: 0
      };

      this.raf = 0;
      this.last = 0;
      this.alive = true;

      this.setupDOM();
      this.initEvents();
      this.paint();
      this.wake();
    }

    setupDOM() {
      // Set initial CSS variables
      const loop = [...this.palette, this.palette[0]];
      this.root.style.setProperty('--gt-gradient', `linear-gradient(${this.settings.angle}deg, ${loop.join(', ')})`);
      this.root.style.setProperty('--gt-border', `${this.settings.borderWidth}px`);
      this.root.style.setProperty('--gt-glow', this.settings.glow);

      let inner = this.root.querySelector(':scope > .gradient-text__inner');
      if (!inner) {
        inner = document.createElement('span');
        inner.className = 'gradient-text__inner';

        const content = document.createElement('span');
        content.className = 'gradient-text__content';

        while (this.root.firstChild) {
          content.appendChild(this.root.firstChild);
        }
        inner.appendChild(content);
        this.root.appendChild(inner);
      }

      this.innerEl = inner;
      this.contentEl = inner.querySelector(':scope > .gradient-text__content');

      if (this.settings.glow > 0) {
        let glowEl = inner.querySelector(':scope > .gradient-text__glow');
        if (!glowEl) {
          glowEl = document.createElement('span');
          glowEl.className = 'gradient-text__glow';
          glowEl.setAttribute('aria-hidden', 'true');
          glowEl.innerHTML = this.contentEl ? this.contentEl.innerHTML : '';
          inner.appendChild(glowEl);
        }
        this.glowEl = glowEl;

        // Keep glow text in sync with content whenever content mutations occur (e.g., character typing)
        if (this.contentEl && window.MutationObserver) {
          this.observer = new MutationObserver(() => {
            if (this.glowEl && this.contentEl) {
              this.glowEl.innerHTML = this.contentEl.innerHTML;
            }
          });
          this.observer.observe(this.contentEl, {
            characterData: true,
            childList: true,
            subtree: true
          });
        }
      }
    }

    paint() {
      const s = this.settings;
      const list = s.colors;
      const cycle = this.state.time / s.speed;
      let image;

      if (s.variant === 'flow') {
        const blobs = list.map((color, i) => {
          const spin = cycle * TAU;
          const rate = 0.55 + ((i * 0.618) % 1) * 0.5;
          let x = 50 + 44 * Math.sin(spin * rate + i * 2.1);
          let y = 50 + 40 * Math.sin(spin * (rate * 0.83 + 0.21) + i * 1.3);
          if (i === 0) {
            x += (this.state.px * 100 - x) * this.state.pull;
            y += (this.state.py * 100 - y) * this.state.pull;
          }
          return `radial-gradient(ellipse ${(22 + 12 * s.scale).toFixed(1)}% ${(60 + 30 * s.scale).toFixed(1)}% at ${x.toFixed(2)}% ${y.toFixed(2)}%, ${color} 0%, transparent 100%)`;
        });
        image = `${blobs.join(', ')}, linear-gradient(${s.angle}deg, ${list.join(', ')})`;
      } else if (s.variant === 'conic') {
        const sway = s.yoyo ? Math.sin(cycle * Math.PI) * 50 : cycle * 360;
        const cx = 50 + (this.state.px * 100 - 50) * this.state.pull;
        const cy = 260 + (this.state.py * 100 - 260) * this.state.pull;
        image = `repeating-conic-gradient(from ${(sway - 30).toFixed(2)}deg at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${[...list, list[0]].map((color, i) => `${color} ${((i / list.length) * 60 * (3 / s.scale)).toFixed(2)}deg`).join(', ')})`;
      } else {
        const loop = [...list, list[0]];
        const period = 100 * s.scale;
        let offset;
        if (s.yoyo) {
          const swing = cycle % 2;
          const t = swing < 1 ? swing : 2 - swing;
          offset = (0.5 - Math.cos(Math.PI * t) / 2) * (period - 100);
        } else {
          offset = (cycle % 1) * period;
        }
        offset += (this.state.px - 0.5) * period * 0.5 * this.state.pull;
        const stops = loop.map((color, i) => `${color} ${((i / (loop.length - 1)) * period - offset).toFixed(2)}%`);
        image = `repeating-linear-gradient(${s.angle}deg, ${stops.join(', ')})`;
      }

      this.root.style.setProperty('--gt-gradient', image);
    }

    tick(now) {
      this.raf = 0;
      if (!this.alive) return;
      const s = this.settings;
      const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
      this.last = now;

      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const paused = reduce || (s.pauseOnHover && this.state.inside);
      if (!paused) this.state.time += dt;

      const target = s.followPointer && this.state.inside ? 1 : 0;
      this.state.pull += (target - this.state.pull) * (1 - Math.exp(-dt * 6));

      const stiffness = 160;
      this.state.vx += ((this.state.x - this.state.px) * stiffness - this.state.vx * 2 * Math.sqrt(stiffness)) * dt;
      this.state.vy += ((this.state.y - this.state.py) * stiffness - this.state.vy * 2 * Math.sqrt(stiffness)) * dt;
      this.state.px += this.state.vx * dt;
      this.state.py += this.state.vy * dt;

      this.paint();

      const settling = Math.abs(this.state.pull - target) > 0.001 || Math.abs(this.state.vx) + Math.abs(this.state.vy) > 0.001;
      if (!this.state.visible || (paused && !settling)) return;

      this.raf = requestAnimationFrame(this.tick.bind(this));
    }

    wake() {
      if (this.raf || !this.alive) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick.bind(this));
    }

    locate(event) {
      const rect = this.root.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.state.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      this.state.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    }

    initEvents() {
      this._onEnter = (event) => {
        this.locate(event);
        if (!this.state.inside) {
          this.state.px = this.state.x;
          this.state.py = this.state.y;
        }
        this.state.inside = true;
        this.wake();
      };

      this._onMove = (event) => {
        this.locate(event);
        this.wake();
      };

      this._onLeave = () => {
        this.state.inside = false;
        this.wake();
      };

      this.root.addEventListener('pointerenter', this._onEnter, { passive: true });
      this.root.addEventListener('pointermove', this._onMove, { passive: true });
      this.root.addEventListener('pointerleave', this._onLeave, { passive: true });

      if (window.IntersectionObserver) {
        this.intersectionObserver = new IntersectionObserver(entries => {
          this.state.visible = entries.some(entry => entry.isIntersecting);
          if (this.state.visible) this.wake();
        });
        this.intersectionObserver.observe(this.root);
      }

      // Theme toggle observer
      if (window.MutationObserver) {
        this.themeObserver = new MutationObserver(() => {
          const isLight = document.documentElement.getAttribute('data-theme') === 'light';
          if (isLight !== this.isLight) {
            this.isLight = isLight;
            this.palette = this.isLight ? this.lightPalette : this.darkPalette;
            this.settings.colors = this.palette;
            this.paint();
            this.wake();
          }
        });
        this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      }
    }

    destroy() {
      this.alive = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      if (this.observer) this.observer.disconnect();
      if (this.themeObserver) this.themeObserver.disconnect();
      this.root.removeEventListener('pointerenter', this._onEnter);
      this.root.removeEventListener('pointermove', this._onMove);
      this.root.removeEventListener('pointerleave', this._onLeave);
      delete this.root._gtInstance;
    }
  }

  // Global Registry and Auto-Init
  const instances = [];

  function init(target = '[data-gradient-text="true"], .gradient-text') {
    const elements = typeof target === 'string' ? document.querySelectorAll(target) : (target instanceof NodeList || Array.isArray(target) ? target : [target]);
    elements.forEach(el => {
      if (!el || el._gtInstance) return;
      instances.push(new GradientTextInstance(el));
    });
  }

  window.GradientText = {
    init,
    create: (el, opts) => new GradientTextInstance(el, opts),
    instances
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
})();
