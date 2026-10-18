/**
 * CountUp - Vanilla JS Runtime (React Bits Integration)
 * High-performance animated number counter and odometer roll effect with:
 * - Digit swap counting & odometer column rolling
 * - Physics springs & cubic-bezier easing
 * - Thousands separators, prefix/suffix, compact formatting
 * - Viewport trigger via IntersectionObserver & replay on hover
 * - Full reduced-motion accessibility support
 */
(function() {
  'use strict';

  const CELL = 1.2;
  const STAGGER = 0.07;
  const UNITS = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K']
  ];
  const SLOT_STYLE = `display: inline-block; height: ${CELL}em; line-height: ${CELL}em;`;
  const SR_ONLY_STYLE = `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;`;

  const clamp01 = value => Math.min(1, Math.max(0, value));
  const smooth = (edge0, edge1, value) => {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };
  const mod10 = value => ((value % 10) + 10) % 10;

  const makeSpring = overshoot => {
    const log = Math.log(Math.min(0.5, Math.max(0.001, overshoot)));
    const zeta = -log / Math.sqrt(Math.PI * Math.PI + log * log);
    const damped = Math.PI / 0.52;
    const natural = damped / Math.sqrt(1 - zeta * zeta);
    const raw = t =>
      1 - Math.exp(-zeta * natural * t) * (Math.cos(damped * t) + ((zeta * natural) / damped) * Math.sin(damped * t));
    const residual = 1 - raw(1);
    return t => (t >= 1 ? 1 : raw(t) + residual * t * t * t);
  };

  function createCubicBezier(p1x, p1y, p2x, p2y) {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;

    function sampleCurveX(t) { return ((ax * t + bx) * t + cx) * t; }
    function sampleCurveY(t) { return ((ay * t + by) * t + cy) * t; }

    function solveCurveX(x, epsilon) {
      epsilon = epsilon || 1e-6;
      let t2 = x;
      for (let i = 0; i < 8; i++) {
        const x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon) return t2;
        const d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
        if (Math.abs(d2) < 1e-6) break;
        t2 -= x2 / d2;
      }
      let t0 = 0, t1 = 1;
      t2 = x;
      while (t0 < t1) {
        const x2 = sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon) return t2;
        if (x > x2) t0 = t2;
        else t1 = t2;
        t2 = (t1 + t0) * 0.5;
      }
      return t2;
    }

    return t => (t <= 0 ? 0 : t >= 1 ? 1 : sampleCurveY(solveCurveX(t)));
  }

  const EASINGS = {
    linear: t => t,
    easeOut: createCubicBezier(0.33, 1, 0.68, 1),
    expo: t => (t >= 1 ? 1 : (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10))),
    spring: makeSpring(0.06)
  };

  const getDecimalPlaces = num => {
    const str = String(num);
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (parseInt(decimals, 10) !== 0) {
        return decimals.length;
      }
    }
    return 0;
  };

  const unitFor = value => UNITS.find(([size]) => Math.abs(value) >= size * 0.9995) || [1, ''];

  const scaleFor = (value, compact, decimals, places) => {
    if (!compact) return { size: 1, label: '', digits: places };
    const [size, label] = unitFor(value);
    const digits = decimals !== undefined ? decimals : (label ? (Math.abs(value) / size < 100 ? 1 : 0) : places);
    return { size, label, digits };
  };

  const splitNumber = (value, digits, size) => {
    const fixed = (Math.abs(value) / size).toFixed(digits);
    const [int, frac = ''] = fixed.split('.');
    return { negative: value < 0 && Number(fixed) !== 0, int, frac };
  };

  const group = (int, separator) => (separator ? int.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : int);

  const buildRoll = (a, b, spin, { compact, decimals, places, separator }) => {
    const { size, label, digits } = scaleFor(b, compact, decimals, places);
    const pa = splitNumber(a, digits, size);
    const pb = splitNumber(b, digits, size);
    const length = Math.max(pa.int.length, pb.int.length);
    const slots = [];
    const columns = [];
    if (pa.negative || pb.negative) slots.push({ char: '-', enter: !pa.negative, leave: !pb.negative });
    const digitAt = (parts, place) => {
      if (place < 0) return Number(parts.frac[-place - 1]);
      const index = parts.int.length - 1 - place;
      return index >= 0 ? Number(parts.int[index]) : null;
    };
    for (let place = length - 1; place >= -digits; place--) {
      if (place === -1) slots.push({ char: '.' });
      const start = digitAt(pa, place);
      const end = digitAt(pb, place);
      const column = {
        slot: slots.length,
        index: columns.length,
        place,
        from: start !== null ? start : 0,
        to: end !== null ? end : 0,
        enter: start === null,
        leave: end === null
      };
      slots.push(column);
      columns.push(column);
      if (separator && place > 0 && place % 3 === 0) slots.push({ char: separator, follow: column.index });
    }
    const up = spin || b >= a;
    columns.forEach((column, index) => {
      const rank = columns.length - 1 - index;
      const base = up ? mod10(column.to - column.from) : -mod10(column.from - column.to);
      const turns = spin
        ? Math.max(1, 3 - rank)
        : Math.min(Math.floor(Math.abs(b - a) / (size * 10 ** (column.place + 1))), Math.max(0, 3 - rank));
      column.delta = base + (up ? 10 : -10) * turns;
    });
    return { slots, columns, label };
  };

  class CountUpInstance {
    constructor(element, options = {}) {
      if (!element || element._countUpInstance) return;
      this.element = element;
      this.element._countUpInstance = this;

      const ds = element.dataset || {};
      
      // Auto-extract numbers and suffixes/prefixes from existing inner text if not specified
      const rawText = element.textContent.trim();
      let inferredTo = null;
      let inferredPrefix = '';
      let inferredSuffix = '';

      if (rawText && ds.to === undefined && options.to === undefined) {
        const match = rawText.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
        if (match) {
          inferredPrefix = match[1] || '';
          inferredTo = parseFloat(match[2]);
          inferredSuffix = match[3] || '';
        }
      }

      this.to = options.to !== undefined ? Number(options.to) : (ds.to !== undefined ? Number(ds.to) : (inferredTo !== null ? inferredTo : 100));
      this.from = options.from !== undefined ? Number(options.from) : (ds.from !== undefined ? Number(ds.from) : 0);
      this.direction = options.direction || ds.direction || 'up';
      this.delay = options.delay !== undefined ? Number(options.delay) : (ds.delay !== undefined ? Number(ds.delay) : 0);
      this.duration = options.duration !== undefined ? Number(options.duration) : (ds.duration !== undefined ? Number(ds.duration) : 2);
      this.separator = options.separator !== undefined ? options.separator : (ds.separator !== undefined ? ds.separator : '');
      this.prefix = options.prefix !== undefined ? options.prefix : (ds.prefix !== undefined ? ds.prefix : inferredPrefix);
      this.suffix = options.suffix !== undefined ? options.suffix : (ds.suffix !== undefined ? ds.suffix : inferredSuffix);
      this.mode = options.mode || ds.mode || 'count';
      this.easing = options.easing || ds.easing || 'easeOut';
      this.decimals = options.decimals !== undefined ? Number(options.decimals) : (ds.decimals !== undefined ? Number(ds.decimals) : undefined);
      this.format = options.format || ds.format || 'standard';
      this.trigger = options.trigger || ds.trigger || 'view';
      this.replayOnHover = options.replayOnHover !== undefined ? Boolean(options.replayOnHover) : (ds.replayOnHover !== undefined ? ds.replayOnHover === 'true' : false);
      this.onStart = options.onStart || null;
      this.onEnd = options.onEnd || null;

      this.uid = 'cu-' + Math.random().toString(36).substring(2, 9);
      this.startValue = this.direction === 'down' ? this.to : this.from;
      this.endValue = this.direction === 'down' ? this.from : this.to;
      this.currentValue = this.startValue;
      this.started = false;
      this.running = false;
      this.rafId = null;

      this.element.style.fontVariantNumeric = 'tabular-nums';

      this.formatValue = this.formatValue.bind(this);
      this.start = this.start.bind(this);
      this.replay = this.replay.bind(this);

      this.init();
    }

    formatValue(value) {
      const compact = this.format === 'compact';
      const places = this.decimals !== undefined ? this.decimals : Math.max(getDecimalPlaces(this.from), getDecimalPlaces(this.to));
      const { size, label, digits } = scaleFor(value, compact, this.decimals, places);
      const parts = splitNumber(value, digits, size);
      const body = `${parts.negative ? '-' : ''}${group(parts.int, this.separator)}${parts.frac ? `.${parts.frac}` : ''}`;
      return `${this.prefix}${body}${label}${this.suffix}`;
    }

    init() {
      if (this.mode === 'roll') {
        this.initRoll();
      } else {
        this.element.textContent = this.formatValue(this.startValue);
      }

      if (this.replayOnHover) {
        this.element.addEventListener('pointerenter', () => {
          this.replay();
        });
      }

      if (this.trigger === 'load') {
        this.start();
      } else {
        // IntersectionObserver for trigger="view"
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.started) {
              this.start();
              observer.unobserve(this.element);
            }
          });
        }, { threshold: 0.15 });

        observer.observe(this.element);
      }
    }

    initRoll() {
      const places = this.decimals !== undefined ? this.decimals : Math.max(getDecimalPlaces(this.from), getDecimalPlaces(this.to));
      this.model = buildRoll(this.startValue, this.endValue, false, {
        compact: this.format === 'compact',
        decimals: this.decimals,
        places,
        separator: this.separator
      });

      this.element.innerHTML = '';

      const container = document.createElement('span');
      container.setAttribute('aria-hidden', 'true');
      container.style.cssText = 'display: inline-flex; white-space: pre; user-select: none;';

      if (this.prefix) {
        const pSpan = document.createElement('span');
        pSpan.style.cssText = SLOT_STYLE;
        pSpan.textContent = this.prefix;
        container.appendChild(pSpan);
      }

      this.slotElements = [];
      this.filterElements = [];

      this.model.slots.forEach((slot, index) => {
        const sSpan = document.createElement('span');
        sSpan.style.cssText = SLOT_STYLE + ' overflow: hidden;';
        if (slot.char !== undefined) {
          sSpan.textContent = slot.char;
        } else {
          sSpan.style.position = 'relative';
          const strip = document.createElement('span');
          strip.style.cssText = `display: flex; flex-direction: column; transform: translateY(${-CELL}em); will-change: transform;`;
          [-1, 0, 1, 2].map(offset => {
            const digitSpan = document.createElement('span');
            digitSpan.style.cssText = `height: ${CELL}em; line-height: ${CELL}em; text-align: center;`;
            digitSpan.textContent = String(mod10(slot.from + offset));
            strip.appendChild(digitSpan);
          });
          sSpan.appendChild(strip);
        }
        container.appendChild(sSpan);
        this.slotElements[index] = sSpan;
      });

      if (this.model.label) {
        const lSpan = document.createElement('span');
        lSpan.style.cssText = SLOT_STYLE;
        lSpan.textContent = this.model.label;
        container.appendChild(lSpan);
      }

      if (this.suffix) {
        const sufSpan = document.createElement('span');
        sufSpan.style.cssText = SLOT_STYLE;
        sufSpan.textContent = this.suffix;
        container.appendChild(sufSpan);
      }

      this.srOnly = document.createElement('span');
      this.srOnly.style.cssText = SR_ONLY_STYLE;
      this.srOnly.textContent = this.formatValue(this.endValue);

      this.element.appendChild(container);
      this.element.appendChild(this.srOnly);

      // SVG filters for motion blur
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.position = 'absolute';

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.model.columns.forEach(column => {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `${this.uid}-${column.index}`);
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '200%');
        filter.setAttribute('color-interpolation-filters', 'sRGB');

        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('stdDeviation', '0 0');
        filter.appendChild(blur);
        defs.appendChild(filter);

        this.filterElements[column.index] = blur;
      });

      svg.appendChild(defs);
      this.element.appendChild(svg);
    }

    start(fromVal, toVal, spin = false) {
      this.started = true;
      if (this.running && this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.running = false;
      }

      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        this.currentValue = toVal !== undefined ? toVal : this.endValue;
        if (this.mode === 'count') {
          this.element.textContent = this.formatValue(this.currentValue);
        } else if (this.srOnly) {
          this.srOnly.textContent = this.formatValue(this.currentValue);
        }
        if (typeof this.onEnd === 'function') this.onEnd();
        return;
      }

      const from = fromVal !== undefined ? fromVal : this.startValue;
      const to = toVal !== undefined ? toVal : this.endValue;
      const ease = EASINGS[this.easing] || EASINGS.easeOut;
      const total = Math.max(0.001, this.duration);
      const delayMs = (this.delay || 0) * 1000;
      const startTime = performance.now() + delayMs;

      if (typeof this.onStart === 'function') this.onStart();
      this.running = true;

      if (this.mode === 'roll') {
        const places = this.decimals !== undefined ? this.decimals : Math.max(getDecimalPlaces(from), getDecimalPlaces(to));
        const model = buildRoll(from, to, spin, {
          compact: this.format === 'compact',
          decimals: this.decimals,
          places,
          separator: this.separator
        });

        const fontSize = parseFloat(getComputedStyle(this.element).fontSize) || 16;
        const cell = CELL * fontSize;
        const stagger = model.columns.length > 1 ? Math.min(STAGGER, (total * 0.4) / (model.columns.length - 1)) : 0;
        const span = Math.max(0.001, total - stagger * (model.columns.length - 1));

        const columns = model.columns.map(column => {
          const box = this.slotElements[column.slot];
          const strip = box ? box.firstChild : null;
          return {
            ...column,
            box,
            strip,
            blur: this.filterElements[column.index],
            cells: strip ? Array.from(strip.childNodes) : [],
            width: box ? box.scrollWidth : 0,
            ease: this.easing === 'spring' ? makeSpring(Math.min(0.12, Math.max(0.01, 0.35 / Math.max(1, Math.abs(column.delta))))) : ease,
            base: Math.floor(column.from),
            sigma: 0,
            presence: column.enter ? 0 : 1
          };
        });

        const renderRoll = now => {
          if (now < startTime) {
            this.rafId = requestAnimationFrame(renderRoll);
            return;
          }

          const elapsed = (now - startTime) / 1000;
          const t = Math.min(total, elapsed);

          columns.forEach((column, index) => {
            if (!column.strip) return;
            const u = clamp01((t - index * stagger) / span);
            const pos = column.from + column.delta * column.ease(u);
            const base = Math.floor(pos);
            if (base !== column.base) {
              column.base = base;
              column.cells.forEach((node, offset) => {
                if (node) node.textContent = String(mod10(base + offset - 1));
              });
            }
            column.strip.style.transform = `translateY(${(-(1 + pos - base) * CELL).toFixed(4)}em)`;

            const u0 = Math.max(0, u - 0.004);
            const u1 = Math.min(1, u + 0.004);
            const speed = u1 > u0 ? (Math.abs(column.delta) * Math.abs(column.ease(u1) - column.ease(u0))) / (u1 - u0) / span : 0;
            const sigma = u > 0 && u < 1 ? Math.min(cell * 0.05, (speed * cell) / 600) : 0;
            if (Math.abs(sigma - column.sigma) > 0.05 || (sigma === 0 && column.sigma !== 0)) {
              column.sigma = sigma;
              if (sigma > 0.2 && column.blur) {
                column.blur.setAttribute('stdDeviation', `0 ${sigma.toFixed(2)}`);
                column.strip.style.filter = `url(#${this.uid}-${index})`;
              } else {
                column.strip.style.filter = '';
              }
            }
          });

          const overall = clamp01(t / total);
          this.currentValue = from + (to - from) * ease(overall);

          if (elapsed < total) {
            this.rafId = requestAnimationFrame(renderRoll);
          } else {
            this.currentValue = to;
            this.running = false;
            if (this.srOnly) this.srOnly.textContent = this.formatValue(to);
            if (typeof this.onEnd === 'function') this.onEnd();
          }
        };

        this.rafId = requestAnimationFrame(renderRoll);
      } else {
        // mode="count"
        const renderCount = now => {
          if (now < startTime) {
            this.rafId = requestAnimationFrame(renderCount);
            return;
          }

          const elapsed = (now - startTime) / 1000;
          const t = Math.min(total, elapsed);
          const progress = clamp01(t / total);
          const val = from + (to - from) * ease(progress);

          this.currentValue = val;
          this.element.textContent = this.formatValue(val);

          if (elapsed < total) {
            this.rafId = requestAnimationFrame(renderCount);
          } else {
            this.currentValue = to;
            this.element.textContent = this.formatValue(to);
            this.running = false;
            if (typeof this.onEnd === 'function') this.onEnd();
          }
        };

        this.rafId = requestAnimationFrame(renderCount);
      }
    }

    replay() {
      if (this.running || !this.started) return;
      if (this.mode === 'roll') {
        this.start(this.currentValue, this.currentValue, true);
      } else {
        this.start(this.startValue, this.endValue, false);
      }
    }
  }

  window.CountUp = CountUpInstance;

  function initAllCountUp() {
    const targets = document.querySelectorAll('[data-count-up="true"], .count-up, .count-up-text');
    targets.forEach(el => {
      if (!el._countUpInstance) {
        new CountUpInstance(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCountUp);
  } else {
    initAllCountUp();
  }
})();
