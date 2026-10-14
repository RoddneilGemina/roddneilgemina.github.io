/**
 * DotField Component (Vanilla JavaScript + Canvas/SVG Implementation)
 * Based on React Bits <DotField /> component.
 * Features:
 * - High-performance 2D Canvas single-batch dot grid rendering
 * - Physics-based cursor proximity bulge and velocity displacement
 * - SVG radial glow follower matching cursor movement
 * - Adaptive Device Pixel Ratio (DPR) crisp subpixel scaling
 * - IntersectionObserver and Document visibility auto-throttling
 * - Robust viewport coordinate math for fixed and scrolling containers
 */

(function (global) {
  'use strict';

  const TWO_PI = Math.PI * 2;

  class DotFieldInstance {
    constructor(container, options = {}) {
      this.container = container;
      this.options = Object.assign(
        {
          dotRadius: 1.2,
          dotSpacing: 16,
          cursorRadius: 280,
          cursorForce: 0.1,
          bulgeOnly: true,
          bulgeStrength: 52,
          glowRadius: 160,
          sparkle: false,
          waveAmplitude: 0,
          gradientFrom: 'rgba(127, 168, 255, 0.22)',
          gradientTo: 'rgba(237, 234, 228, 0.08)',
          glowColor: 'rgba(127, 168, 255, 0.12)'
        },
        options
      );

      this.dots = [];
      this.mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
      this.raf = 0;
      this.frameCount = 0;
      this.width = 0;
      this.height = 0;
      this.engagement = 0;
      this.glowOpacity = 0;
      this.isVisible = true;
      this.isPageVisible = !document.hidden;
      this.glowId = 'dot-field-glow-' + Math.random().toString(36).slice(2, 9);

      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.updateMouseSpeed = this.updateMouseSpeed.bind(this);
      this.onResize = this.onResize.bind(this);
      this.onVisibility = this.onVisibility.bind(this);
      this.tick = this.tick.bind(this);

      this.setupDOM();
      this.setupObservers();
      this.setupEvents();
      this.resize();
      this.start();
    }

    setupDOM() {
      this.container.classList.add('dot-field-container');

      // Create Canvas
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.container.appendChild(this.canvas);

      // Create SVG for cursor radial glow
      const svgNS = 'http://www.w3.org/2000/svg';
      this.svg = document.createElementNS(svgNS, 'svg');
      this.svg.setAttribute('style', 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;');

      const defs = document.createElementNS(svgNS, 'defs');
      const radialGrad = document.createElementNS(svgNS, 'radialGradient');
      radialGrad.setAttribute('id', this.glowId);

      const stop1 = document.createElementNS(svgNS, 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', this.options.glowColor);

      const stop2 = document.createElementNS(svgNS, 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', 'transparent');

      radialGrad.appendChild(stop1);
      radialGrad.appendChild(stop2);
      defs.appendChild(radialGrad);
      this.svg.appendChild(defs);

      this.glowCircle = document.createElementNS(svgNS, 'circle');
      this.glowCircle.setAttribute('cx', '-9999');
      this.glowCircle.setAttribute('cy', '-9999');
      this.glowCircle.setAttribute('r', String(this.options.glowRadius));
      this.glowCircle.setAttribute('fill', `url(#${this.glowId})`);
      this.glowCircle.setAttribute('style', 'opacity: 0; will-change: opacity;');
      this.svg.appendChild(this.glowCircle);

      this.container.appendChild(this.svg);
    }

    setupObservers() {
      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(this.container);
      }

      if (typeof IntersectionObserver !== 'undefined') {
        this.io = new IntersectionObserver((entries) => {
          this.isVisible = entries[0].isIntersecting;
          if (this.isVisible) this.start();
          else this.stop();
        }, { threshold: 0.05 });
        this.io.observe(this.container);
      }
    }

    setupEvents() {
      window.addEventListener('resize', this.onResize, { passive: true });
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      document.addEventListener('mouseleave', this.onMouseLeave);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.speedInterval = setInterval(this.updateMouseSpeed, 20);
    }

    onVisibility() {
      this.isPageVisible = !document.hidden;
      if (this.isPageVisible) this.start();
      else this.stop();
    }

    onResize() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.resize(), 80);
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = w;
      this.height = h;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.buildDots(w, h);
    }

    buildDots(w, h) {
      const opt = this.options;
      const step = opt.dotRadius + opt.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const total = rows * cols;
      const dots = new Array(total);
      let idx = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[idx++] = {
            ax,
            ay,
            sx: ax,
            sy: ay,
            vx: 0,
            vy: 0,
            x: ax,
            y: ay
          };
        }
      }

      this.dots = dots;
    }

    onMouseMove(e) {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }

    onMouseLeave() {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    }

    updateMouseSpeed() {
      const m = this.mouse;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    start() {
      if (this.isVisible && this.isPageVisible && !this.raf) {
        this.raf = requestAnimationFrame(this.tick);
      }
    }

    stop() {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    }

    tick() {
      this.frameCount++;
      const dots = this.dots;
      const m = this.mouse;
      const w = this.width;
      const h = this.height;
      const opt = this.options;
      const len = dots.length;
      const t = this.frameCount * 0.02;

      const targetEngagement = Math.min(m.speed / 5, 1);
      this.engagement += (targetEngagement - this.engagement) * 0.06;
      if (this.engagement < 0.001) this.engagement = 0;
      const eng = this.engagement;

      this.glowOpacity += (eng - this.glowOpacity) * 0.08;

      if (this.glowCircle) {
        this.glowCircle.setAttribute('cx', String(m.x));
        this.glowCircle.setAttribute('cy', String(m.y));
        this.glowCircle.style.opacity = String(this.glowOpacity);
      }

      this.ctx.clearRect(0, 0, w, h);

      const grad = this.ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, opt.gradientFrom);
      grad.addColorStop(1, opt.gradientTo);
      this.ctx.fillStyle = grad;

      const cr = opt.cursorRadius;
      const crSq = cr * cr;
      const rad = opt.dotRadius / 2;
      const isBulge = opt.bulgeOnly;

      this.ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const factor = 1 - dist / cr;
            const push = factor * factor * opt.bulgeStrength * eng;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const move = (500 / dist) * (m.speed * opt.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;

        if (opt.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * opt.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * opt.waveAmplitude * 0.5;
        }

        if (opt.sparkle) {
          const hash = ((i * 2654435761) ^ (this.frameCount >> 3)) >>> 0;
          if ((hash % 100) < 3) {
            this.ctx.moveTo(drawX + rad * 1.8, drawY);
            this.ctx.arc(drawX, drawY, rad * 1.8, 0, TWO_PI);
          } else {
            this.ctx.moveTo(drawX + rad, drawY);
            this.ctx.arc(drawX, drawY, rad, 0, TWO_PI);
          }
        } else {
          this.ctx.moveTo(drawX + rad, drawY);
          this.ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }

      this.ctx.fill();

      this.raf = requestAnimationFrame(this.tick);
    }

    setThemeMode(isLight) {
      if (isLight) {
        this.options.gradientFrom = 'rgba(2, 132, 199, 0.28)';
        this.options.gradientTo = 'rgba(100, 116, 139, 0.12)';
        this.options.glowColor = 'rgba(2, 132, 199, 0.12)';
      } else {
        this.options.gradientFrom = 'rgba(127, 168, 255, 0.22)';
        this.options.gradientTo = 'rgba(237, 234, 228, 0.08)';
        this.options.glowColor = 'rgba(127, 168, 255, 0.12)';
      }

      const stop1 = this.svg?.querySelector('stop');
      if (stop1) stop1.setAttribute('stop-color', this.options.glowColor);
    }

    destroy() {
      this.stop();
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      clearInterval(this.speedInterval);
      clearTimeout(this.resizeTimer);
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseleave', this.onMouseLeave);
      document.removeEventListener('visibilitychange', this.onVisibility);

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      if (this.svg && this.svg.parentNode) {
        this.svg.parentNode.removeChild(this.svg);
      }
    }
  }

  function initDotField(container, options) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return null;
    return new DotFieldInstance(container, options);
  }

  global.DotField = {
    init: initDotField,
    Instance: DotFieldInstance
  };
})(typeof window !== 'undefined' ? window : this);
