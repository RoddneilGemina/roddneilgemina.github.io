/**
 * SpotlightCard Component (Vanilla JavaScript + CSS Implementation)
 * Based on React Bits SpotlightCard component.
 * Features:
 * - Dynamic cursor spotlight with radial falloff
 * - Interactive perimeter border glow with mask exclusion
 * - Pointer proximity detection across neighboring cards
 * - Click pressure flare and spring dynamics
 * - IntersectionObserver to pause rendering when offscreen (zero battery/GPU waste)
 */

(function (global) {
  'use strict';

  const THEMES = {
    dark: {
      surface: 'rgba(8, 14, 28, 0.82)',
      border: 'rgba(0, 240, 255, 0.16)',
      shadow: '0 20px 48px -15px rgba(0, 0, 0, 0.85)',
      light: '#00f0ff',
      fill: 1,
      edge: 1
    },
    light: {
      surface: '#ffffff',
      border: 'rgba(2, 132, 199, 0.18)',
      shadow: '0 1px 2px rgba(24, 24, 27, 0.04), 0 18px 40px -20px rgba(2, 132, 199, 0.12)',
      light: '#0284c7',
      fill: 0.32,
      edge: 0.75
    }
  };

  const NOISE =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const falloff = (color, softness) => {
    const soft = clamp(softness, 0, 1);
    const core = (1 - soft) ** 1.5 * 0.85;
    const stop = (alpha, at) =>
      `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(2)}%, transparent) ${(at * 100).toFixed(2)}%`;
    const list = [stop(1, 0)];
    for (let i = 0; i <= 14; i++) {
      const t = core + ((1 - core) * i) / 14;
      const g = (t - core) / (1 - core);
      const smooth = 1 - g * g * (3 - 2 * g);
      const glow = Math.exp(-4.6 * g * g) * (1 - g ** 6);
      list.push(stop(smooth + (glow - smooth) * soft, t));
    }
    return list.join(', ');
  };

  class SpotlightCardElement {
    constructor(root) {
      this.root = root;
      this.theme = root.getAttribute('data-theme') || (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
      this.palette = THEMES[this.theme] ?? THEMES.dark;
      
      const customColor = root.getAttribute('data-spotlight-color');
      this.color = customColor || this.palette.light;
      this.shape = root.getAttribute('data-shape') === 'beam' ? 'beam' : 'circle';
      this.intensity = parseFloat(root.getAttribute('data-intensity')) || 0.16;
      this.spotlightSize = parseFloat(root.getAttribute('data-spotlight-size')) || 240;
      this.softness = parseFloat(root.getAttribute('data-softness')) || 0.7;
      this.borderGlow = parseFloat(root.getAttribute('data-border-glow')) || 0.6;
      this.proximity = parseFloat(root.getAttribute('data-proximity')) || 80;
      this.smoothing = parseFloat(root.getAttribute('data-smoothing')) || 0.3;
      this.ambient = root.getAttribute('data-ambient') === 'true';
      this.flare = root.getAttribute('data-flare') !== 'false';
      this.grain = parseFloat(root.getAttribute('data-grain')) || 0;

      this.settings = {
        shape: this.shape,
        fill: falloff(this.color, this.softness),
        edge: falloff(this.color, 1),
        size: Math.max(20, this.spotlightSize),
        intensity: clamp(this.intensity, 0, 1) * this.palette.fill,
        borderGlow: clamp(this.borderGlow, 0, 1) * this.palette.edge,
        proximity: Math.max(0, this.proximity),
        smoothing: clamp(this.smoothing, 0, 1),
        ambient: this.ambient,
        flare: this.flare,
        grain: clamp(this.grain, 0, 1)
      };

      this.initDOM();
      this.initEvents();
    }

    initDOM() {
      this.root.classList.add('spotlight-card');
      
      let light = this.root.querySelector('.spotlight-card__light');
      if (!light) {
        light = document.createElement('span');
        light.className = 'spotlight-card__light';
        light.setAttribute('aria-hidden', 'true');
        this.root.appendChild(light);
      }
      this.light = light;

      let grain = this.root.querySelector('.spotlight-card__grain');
      if (!grain && this.settings.grain > 0) {
        grain = document.createElement('span');
        grain.className = 'spotlight-card__grain';
        grain.style.backgroundImage = NOISE;
        grain.setAttribute('aria-hidden', 'true');
        this.root.appendChild(grain);
      }
      this.grainEl = grain;

      let border = this.root.querySelector('.spotlight-card__border');
      if (!border) {
        border = document.createElement('span');
        border.className = 'spotlight-card__border';
        border.setAttribute('aria-hidden', 'true');
        this.root.appendChild(border);
      }
      this.border = border;

      let edge = this.root.querySelector('.spotlight-card__edge');
      if (!edge) {
        edge = document.createElement('span');
        edge.className = 'spotlight-card__edge';
        edge.setAttribute('aria-hidden', 'true');
        this.root.appendChild(edge);
      }
      this.edge = edge;
    }

    initEvents() {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      this.state = { x: 0, y: 0, presence: 0, flare: 0, time: Math.random() * 60, pressed: false, visible: true };
      this.pointer = { x: 0, y: 0, active: false };
      this.drawn = { light: '', edge: '', noise: '' };
      this.focus = null;
      this.raf = 0;
      this.last = 0;
      this.alive = true;

      const gradient = (s, size, x, y, stops) => {
        if (s.shape === 'beam') {
          const reach = Math.max(size * 0.6, y + size * 0.55);
          return `radial-gradient(${(size * 0.55).toFixed(1)}px ${reach.toFixed(1)}px at ${x.toFixed(1)}px 0px, ${stops})`;
        }
        return `radial-gradient(circle ${size.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;
      };

      this.paint = s => {
        const size = s.size * (1 + 0.2 * this.state.flare);
        const boost = 1 + 0.7 * this.state.flare;
        const fill = gradient(s, size, this.state.x, this.state.y, s.fill);
        const rim = gradient(s, size * 0.6, this.state.x, s.shape === 'beam' ? 0 : this.state.y, s.edge);
        
        if (fill !== this.drawn.light) {
          this.drawn.light = fill;
          this.light.style.background = fill;
        }
        if (rim !== this.drawn.edge) {
          this.drawn.edge = rim;
          this.edge.style.background = rim;
        }
        this.light.style.opacity = String(Math.min(1, this.state.presence * s.intensity * boost));
        this.edge.style.opacity = String(Math.min(1, this.state.presence * s.borderGlow * boost));
        
        if (this.grainEl && s.grain > 0) {
          const grainy = gradient(s, size, this.state.x, this.state.y, '#000 0%, transparent 100%');
          if (grainy !== this.drawn.noise) {
            this.drawn.noise = grainy;
            this.grainEl.style.webkitMaskImage = grainy;
            this.grainEl.style.maskImage = grainy;
          }
          this.grainEl.style.opacity = String(this.state.presence * s.grain);
        }
      };

      const tick = now => {
        this.raf = 0;
        if (!this.alive) return;
        const s = this.settings;
        const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
        this.last = now;
        const rect = this.root.getBoundingClientRect();
        let tx = this.state.x;
        let ty = this.state.y;
        let target = 0;

        if (this.focus && this.root.contains(this.focus)) {
          const box = this.focus.getBoundingClientRect();
          tx = box.left + box.width / 2 - rect.left;
          ty = box.top + box.height / 2 - rect.top;
          target = 1;
        } else if (this.pointer.active) {
          tx = this.pointer.x - rect.left;
          ty = this.pointer.y - rect.top;
          const gap = Math.hypot(Math.max(0, -tx, tx - rect.width), Math.max(0, -ty, ty - rect.height));
          if (gap === 0) target = 1;
          else if (s.proximity > 0) target = Math.max(0, 1 - gap / s.proximity) ** 2;
        }

        if (target < 0.6 && s.ambient && this.state.visible) {
          if (!reduce) this.state.time += dt;
          const drift = 0.6 - target;
          tx += (rect.width * (0.5 + 0.34 * Math.sin(this.state.time * 0.43)) - tx) * (drift / 0.6);
          ty += (rect.height * (0.5 + 0.3 * Math.sin(this.state.time * 0.61 + 1.3)) - ty) * (drift / 0.6);
          target = 0.6;
        }

        if (this.state.presence < 0.02 && target > 0 && !s.ambient) {
          this.state.x = tx;
          this.state.y = ty;
        }

        const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.015 + s.smoothing * 0.22));
        this.state.x += (tx - this.state.x) * follow;
        this.state.y += (ty - this.state.y) * follow;
        const fade = reduce ? 1 : 1 - Math.exp(-dt / (target > this.state.presence ? 0.1 : 0.32));
        this.state.presence += (target - this.state.presence) * fade;
        if (Math.abs(target - this.state.presence) < 0.002) this.state.presence = target;

        const press = this.state.pressed && s.flare && !reduce ? 1 : 0;
        this.state.flare += (press - this.state.flare) * (1 - Math.exp(-dt / (press ? 0.05 : 0.28)));
        if (Math.abs(press - this.state.flare) < 0.002) this.state.flare = press;

        this.paint(s);

        const moving = Math.abs(tx - this.state.x) > 0.1 || Math.abs(ty - this.state.y) > 0.1;
        const settled = !moving && this.state.presence === target && this.state.flare === press;
        if (!settled || (s.ambient && this.state.visible && !reduce)) {
          this.raf = requestAnimationFrame(tick);
        }
      };

      this.wake = () => {
        if (this.raf || !this.alive) return;
        this.last = performance.now();
        this.raf = requestAnimationFrame(tick);
      };

      const onMove = event => {
        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;
        this.pointer.active = true;
        if (this.state.presence > 0 || this.settings.proximity > 0 || this.root.contains(event.target)) {
          this.wake();
        }
      };

      const onOut = event => {
        if (event.relatedTarget) return;
        this.pointer.active = false;
        this.wake();
      };

      const onDown = event => {
        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;
        this.pointer.active = true;
        this.state.pressed = true;
        this.wake();
      };

      const onUp = event => {
        if (event.pointerType !== 'mouse') this.pointer.active = false;
        if (!this.state.pressed && event.pointerType === 'mouse') return;
        this.state.pressed = false;
        this.wake();
      };

      this.observer = new IntersectionObserver(entries => {
        this.state.visible = entries.some(entry => entry.isIntersecting);
        if (this.state.visible) this.wake();
      });
      this.observer.observe(this.root);

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      window.addEventListener('pointercancel', onUp, { passive: true });
      window.addEventListener('scroll', () => {
        if (this.pointer.active || this.state.presence > 0) this.wake();
      }, { capture: true, passive: true });
      document.addEventListener('pointerout', onOut, { passive: true });
      this.root.addEventListener('pointerdown', onDown);

      // Listen for theme changes
      const themeObserver = new MutationObserver(() => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        if (newTheme !== this.theme) {
          this.theme = newTheme;
          this.palette = THEMES[this.theme] ?? THEMES.dark;
          this.settings.intensity = clamp(this.intensity, 0, 1) * this.palette.fill;
          this.settings.borderGlow = clamp(this.borderGlow, 0, 1) * this.palette.edge;
          this.wake();
        }
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      this.wake();
    }
  }

  function initAllSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card, [data-spotlight-card="true"]');
    cards.forEach(card => {
      if (!card.__spotlightCardInstance) {
        card.__spotlightCardInstance = new SpotlightCardElement(card);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSpotlightCards);
  } else {
    initAllSpotlightCards();
  }

  global.SpotlightCard = {
    init: initAllSpotlightCards,
    SpotlightCardElement
  };

})(typeof window !== 'undefined' ? window : this);
