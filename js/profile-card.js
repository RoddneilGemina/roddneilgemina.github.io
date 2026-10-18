/**
 * ProfileCard Component (Vanilla JavaScript + CSS Implementation)
 * Based on React Bits <ProfileCard /> component.
 * Features:
 * - 120Hz dual-axis spring physics with stiffness and damping
 * - Holographic foil with chromatic spectrum, bar lines, and RG pattern mask
 * - Specular glare and radial light tracking with parallax depth
 * - Dynamic tilt with intro settling sequence
 * - Deviceorientation mobile gyro tilt support
 */

(function (global) {
  'use strict';

  const THEMES = {
    dark: {
      '--pc-frame': 'rgba(38, 35, 46, 0.66)',
      '--pc-frame-edge': 'rgba(255, 255, 255, 0.08)',
      '--pc-frame-highlight': 'rgba(255, 255, 255, 0.07)',
      '--pc-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
      '--pc-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
      '--pc-tile-edge': 'rgba(255, 255, 255, 0.07)',
      '--pc-tile-highlight': 'rgba(255, 255, 255, 0.12)',
      '--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
      '--pc-ink': '#f4f4f5',
      '--pc-muted': 'rgba(244, 244, 245, 0.6)',
      '--pc-hover': 'brightness(1.12)',
      '--pc-press': 'brightness(0.8)',
      '--pc-shade': 'rgba(0, 0, 0, 0.4)'
    },
    light: {
      '--pc-frame': 'rgba(240, 240, 243, 0.8)',
      '--pc-frame-edge': 'rgba(24, 24, 27, 0.07)',
      '--pc-frame-highlight': 'rgba(255, 255, 255, 0.95)',
      '--pc-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
      '--pc-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
      '--pc-tile-edge': 'rgba(24, 24, 27, 0.08)',
      '--pc-tile-highlight': 'rgba(255, 255, 255, 1)',
      '--pc-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
      '--pc-ink': '#27272a',
      '--pc-muted': 'rgba(39, 39, 42, 0.6)',
      '--pc-hover': 'brightness(0.97)',
      '--pc-press': 'brightness(0.92)',
      '--pc-shade': 'rgba(24, 24, 27, 0.14)'
    }
  };

  const FOILS = {
    dark: {
      '--pc-blend': 'color-dodge',
      '--pc-holo-filter': 'hue-rotate(0deg)',
      '--pc-sheen': 'rgba(255, 255, 255, 0.16)'
    },
    light: {
      '--pc-blend': 'multiply',
      '--pc-holo-filter': 'invert(1) hue-rotate(180deg)',
      '--pc-sheen': 'rgba(255, 255, 255, 0)'
    }
  };

  const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
  )}")`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const isDark = color => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
    if (!match) return null;
    const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
    const [r, g, b] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
  };

  class ProfileCardInstance {
    constructor(element, options = {}) {
      this.root = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.root || this.root._profileCardInstance) return;
      this.root._profileCardInstance = this;

      const ds = this.root.dataset;

      this.options = Object.assign(
        {
          holo: ds.holo ? parseFloat(ds.holo) : 0.8,
          glare: ds.glare ? parseFloat(ds.glare) : 0.5,
          radius: ds.radius ? parseFloat(ds.radius) : 16,
          tiltStrength: ds.tiltStrength ? parseFloat(ds.tiltStrength) : 3,
          parallax: ds.parallax ? parseFloat(ds.parallax) : 3,
          enableTilt: ds.enableTilt !== undefined ? ds.enableTilt !== 'false' : true,
          enableMobileTilt: ds.enableMobileTilt === 'true',
          mobileTiltSensitivity: ds.mobileTiltSensitivity ? parseFloat(ds.mobileTiltSensitivity) : 3,
          intro: ds.intro !== undefined ? ds.intro !== 'false' : true,
          theme: ds.theme || 'dark',
          backdropColor: ds.backdropColor || null,
          iconUrl: ds.iconUrl || 'images/rg-pattern.svg',
          patternSize: ds.patternSize || '66px 66px',
          statusColor: ds.statusColor || '#22c55e'
        },
        options
      );

      this.initStyles();
      this.initEvents();
    }

    initStyles() {
      const palette = this.options.theme === 'light' ? 'light' : 'dark';
      const foil = this.options.backdropColor
        ? ((isDark(this.options.backdropColor) ?? palette === 'dark') ? 'dark' : 'light')
        : palette;
      const backdrop = this.options.backdropColor
        ? `linear-gradient(180deg, color-mix(in srgb, ${this.options.backdropColor}, #ffffff 12%) 0%, color-mix(in srgb, ${this.options.backdropColor}, #000000 18%) 100%)`
        : 'var(--pc-tile)';

      for (const [key, val] of Object.entries(THEMES[palette])) {
        this.root.style.setProperty(key, val);
      }
      for (const [key, val] of Object.entries(FOILS[foil])) {
        this.root.style.setProperty(key, val);
      }

      this.root.style.setProperty('--pc-radius', `${Math.max(0, this.options.radius)}px`);
      this.root.style.setProperty('--pc-backdrop', backdrop);
      this.root.style.setProperty('--pc-holo', clamp(this.options.holo, 0, 1));
      this.root.style.setProperty('--pc-glare', clamp(this.options.glare, 0, 1));
      this.root.style.setProperty('--pc-parallax', `${Math.max(0, this.options.parallax)}px`);
      this.root.style.setProperty('--pc-status', this.options.statusColor);
      this.root.style.setProperty('--pc-grain', GRAIN);
      this.root.style.setProperty(
        '--pc-pattern',
        this.options.iconUrl ? `url("${this.options.iconUrl}")` : 'linear-gradient(#000, #000)'
      );
      this.root.style.setProperty(
        '--pc-pattern-size',
        this.options.iconUrl ? this.options.patternSize : '100% 100%'
      );
      this.root.style.setProperty('--pc-holo-gain', this.options.iconUrl ? 1.25 : 0.75);
      this.root.style.setProperty('--pc-holo-detail', this.options.iconUrl && foil === 'dark' ? 1 : 0);
    }

    initEvents() {
      const root = this.root;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const size = { width: root.offsetWidth || 360, height: root.offsetHeight || 500 };
      const x = { p: 0, v: 0, target: 0 };
      const y = { p: 0, v: 0, target: 0 };
      const light = { p: 0, target: 0 };
      let raf = 0;
      let last = 0;
      let slowUntil = 0;
      let touchId = null;

      const write = () => {
        const { enableTilt: tiltOn, tiltStrength: strength, parallax: depth } = this.options;
        const angle = tiltOn && !reduced ? strength : 0;
        const tilt = Math.min(1, Math.hypot(x.p, y.p));
        const style = root.style;
        style.setProperty('--pc-light-x', `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
        style.setProperty('--pc-light-y', `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
        style.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`);
        style.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`);
        style.setProperty('--pc-band-x', `${(50 + x.p * 15).toFixed(2)}%`);
        style.setProperty('--pc-band-y', `${(50 + y.p * 15).toFixed(2)}%`);
        style.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
        style.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
        style.setProperty('--pc-shift-x', `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
        style.setProperty('--pc-shift-y', `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
        style.setProperty('--pc-reach', tilt.toFixed(4));
        style.setProperty('--pc-tilt', (tilt * light.p).toFixed(4));
        style.setProperty('--pc-active', light.p.toFixed(4));
      };

      const frame = now => {
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        const slow = now < slowUntil;
        const stiffness = slow ? 24 : 120;
        const damping = slow ? 9 : 16;
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          for (const axis of [x, y]) {
            axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
            axis.p += axis.v * h;
          }
        }
        const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
        light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
        write();
        const moving =
          Math.abs(x.target - x.p) > 0.0005 ||
          Math.abs(y.target - y.p) > 0.0005 ||
          Math.abs(x.v) > 0.0005 ||
          Math.abs(y.v) > 0.0005 ||
          Math.abs(light.target - light.p) > 0.002;
        if (moving) {
          raf = requestAnimationFrame(frame);
        } else {
          x.p = x.target;
          y.p = y.target;
          light.p = light.target;
          write();
          raf = 0;
        }
      };

      const wake = () => {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };

      const aim = (nx, ny, on = true) => {
        x.target = clamp(nx, -1, 1);
        y.target = clamp(ny, -1, 1);
        light.target = on ? 1 : 0;
        slowUntil = 0;
        wake();
      };

      const aimAt = event => {
        const rect = root.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        aim(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          ((event.clientY - rect.top) / rect.height) * 2 - 1
        );
      };

      const release = () => aim(0, 0, false);

      const onEnter = event => {
        if (event.pointerType === 'mouse') aimAt(event);
      };
      const onMove = event => {
        if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
      };
      const onLeave = event => {
        if (event.pointerType === 'mouse') release();
      };
      const onDown = event => {
        if (event.pointerType === 'mouse') return;
        touchId = event.pointerId;
        aimAt(event);
      };
      const onUp = event => {
        if (event.pointerId !== touchId) return;
        touchId = null;
        release();
      };

      root.addEventListener('pointerenter', onEnter);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerleave', onLeave);
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onUp);

      const observer = new ResizeObserver(() => {
        size.width = root.offsetWidth;
        size.height = root.offsetHeight;
        write();
      });
      observer.observe(root);

      if (this.options.intro && !reduced) {
        x.p = 0.62;
        y.p = -0.55;
        light.p = 1;
        slowUntil = performance.now() + 1400;
        write();
        wake();
      } else {
        write();
      }
    }
  }

  global.ProfileCard = ProfileCardInstance;

  function initAllProfileCards() {
    const cards = document.querySelectorAll('[data-profile-card="true"], .profile-card');
    cards.forEach(el => {
      if (!el._profileCardInstance) {
        new ProfileCardInstance(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllProfileCards);
  } else {
    initAllProfileCards();
  }
})(typeof window !== 'undefined' ? window : this);
