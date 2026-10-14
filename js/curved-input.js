/**
 * CurvedInput Component (Vanilla JavaScript + SVG Implementation)
 * Based on React Bits CurvedInput component.
 * Features:
 * - Dynamic circular arc geometry mapping with configurable bend (sagitta)
 * - True SVG <textPath> typography following the curve
 * - Synchronized animated caret traveling on the arc with text scrolling
 * - Curved interactive submit button with hover glow and key bindings
 * - Seamless integration with form submission and theme toggling
 */

(function (global) {
  'use strict';

  const DEG = 180 / Math.PI;

  const round2 = n => Math.round(n * 100) / 100;

  const hexToRgba = (hex, alpha) => {
    let h = String(hex).replace('#', '');
    if (h.length === 3)
      h = h
        .split('')
        .map(c => c + c)
        .join('');
    const n = parseInt(h.slice(0, 6), 16);
    if (Number.isNaN(n)) return hex;
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  };

  const SHADOWS = { sm: [5, 12, 0.3], md: [10, 24, 0.4], lg: [16, 40, 0.52] };

  const THEMES = {
    dark: {
      backgroundColor: 'rgba(8, 14, 28, 0.95)',
      textColor: '#f8fafc',
      placeholderColor: '#94a3b8',
      borderColor: 'rgba(0, 240, 255, 0.28)',
      buttonColor: '#00f0ff',
      buttonTextColor: '#05070c',
      shadowColor: '#000000'
    },
    light: {
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      placeholderColor: '#64748b',
      borderColor: 'rgba(2, 132, 199, 0.3)',
      buttonColor: '#0284c7',
      buttonTextColor: '#ffffff',
      shadowColor: '#0b0e2a'
    }
  };

  const buildGeometry = (width, bend, thickness, pad) => {
    const W = width;
    const T = thickness;
    const s = Math.max(-W * 0.35, Math.min(bend, W * 0.35));
    const a = Math.abs(s);
    const dir = s >= 0 ? 1 : -1;
    const svgH = T + a + pad * 2;

    if (a < 0.75) {
      const midY = pad + T / 2;
      return {
        straight: true,
        W,
        T,
        svgH,
        uPerLen: 1,
        point: (u, v) => [u, midY + v],
        angleAt: () => 0,
        uFromPoint: x => x
      };
    }

    const R = (W * W * 0.25 + a * a) / (2 * a);
    const cx = W / 2;
    const apexY = pad + T / 2 + (dir > 0 ? 0 : a);
    const cy = apexY + dir * R;
    const phi = Math.asin(Math.min(1, W / (2 * R)));

    return {
      straight: false,
      W,
      T,
      svgH,
      R,
      dir,
      uPerLen: W / (2 * R * phi),
      point: (u, v) => {
        const th = ((u - cx) / cx) * phi;
        const rho = R - dir * v;
        return [cx + rho * Math.sin(th), cy - dir * rho * Math.cos(th)];
      },
      angleAt: u => dir * ((u - cx) / cx) * phi * DEG,
      uFromPoint: (x, y) => {
        const th = Math.atan2(x - cx, dir * (cy - y));
        return cx + (th / phi) * cx;
      }
    };
  };

  const fmt = (g, u, v) => {
    const [x, y] = g.point(u, v);
    return `${round2(x)} ${round2(y)}`;
  };

  const edgeSeg = (g, uTo, v, ltr) => {
    if (g.straight) return `L ${fmt(g, uTo, v)}`;
    const rho = round2(g.R - g.dir * v);
    const sweep = ltr === (g.dir > 0) ? 1 : 0;
    return `A ${rho} ${rho} 0 0 ${sweep} ${fmt(g, uTo, v)}`;
  };

  const bentRectPath = (g, u0, u1, vTop, vBot, radius) => {
    const rc = Math.max(0, Math.min(radius, (vBot - vTop) / 2, (u1 - u0) / 2));
    return [
      `M ${fmt(g, u0 + rc, vTop)}`,
      edgeSeg(g, u1 - rc, vTop, true),
      `Q ${fmt(g, u1, vTop)} ${fmt(g, u1, vTop + rc)}`,
      `L ${fmt(g, u1, vBot - rc)}`,
      `Q ${fmt(g, u1, vBot)} ${fmt(g, u1 - rc, vBot)}`,
      edgeSeg(g, u0 + rc, vBot, false),
      `Q ${fmt(g, u0, vBot)} ${fmt(g, u0, vBot - rc)}`,
      `L ${fmt(g, u0, vTop + rc)}`,
      `Q ${fmt(g, u0, vTop)} ${fmt(g, u0 + rc, vTop)}`,
      'Z'
    ].join(' ');
  };

  const bentLinePath = (g, u0, u1, v) => `M ${fmt(g, u0, v)} ${edgeSeg(g, u1, v, true)}`;

  let idCounter = 0;

  class CurvedInputElement {
    constructor(container) {
      this.container = container;
      this.uid = 'curved-' + (++idCounter);
      this.layoutPathId = `ci-text-${this.uid}`;
      this.buttonPathId = `ci-btn-${this.uid}`;
      this.clipId = `ci-clip-${this.uid}`;

      this.theme = container.getAttribute('data-theme') || (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
      this.palette = THEMES[this.theme] || THEMES.dark;

      this.placeholder = container.getAttribute('data-placeholder') || 'Your message or email...';
      this.buttonText = container.getAttribute('data-button-text') || 'Send';
      this.bend = parseFloat(container.getAttribute('data-bend')) || 24;
      this.height = parseFloat(container.getAttribute('data-height')) || 64;
      this.cornerRadius = parseFloat(container.getAttribute('data-corner-radius')) || 20;
      this.borderWidth = parseFloat(container.getAttribute('data-border-width')) || 1.5;
      this.fontSize = parseFloat(container.getAttribute('data-font-size')) || 16;
      this.showButton = container.getAttribute('data-show-button') !== 'false';
      this.showIcon = container.getAttribute('data-show-icon') !== 'false';
      this.shadowSize = container.getAttribute('data-shadow-size') || 'md';

      this.innerValue = container.getAttribute('data-default-value') || '';
      this.caretIndex = this.innerValue.length;
      this.focused = false;
      this.caretU = 0;
      this.scrollLen = 0;
      this.btnTextW = 46;

      this.initDOM();
      this.initEvents();
      this.render();
    }

    initDOM() {
      this.container.classList.add('curved-input');
      this.container.innerHTML = '';

      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.classList.add('curved-input__svg');
      this.container.appendChild(this.svg);

      this.input = document.createElement('input');
      this.input.className = 'curved-input__field';
      this.input.type = 'text';
      this.input.value = this.innerValue;
      this.input.setAttribute('aria-label', this.placeholder);
      this.input.setAttribute('autocomplete', 'off');
      this.input.setAttribute('spellcheck', 'false');
      this.container.appendChild(this.input);
    }

    getColors() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const p = isLight ? THEMES.light : THEMES.dark;
      return {
        bgColor: this.container.getAttribute('data-bg-color') || p.backgroundColor,
        fgColor: this.container.getAttribute('data-text-color') || p.textColor,
        phColor: this.container.getAttribute('data-placeholder-color') || p.placeholderColor,
        strokeColor: this.container.getAttribute('data-border-color') || p.borderColor,
        accentColor: this.container.getAttribute('data-button-color') || p.buttonColor,
        btnFgColor: this.container.getAttribute('data-button-text-color') || p.buttonTextColor,
        shColor: this.container.getAttribute('data-shadow-color') || p.shadowColor
      };
    }

    render() {
      const rect = this.container.getBoundingClientRect();
      const w = Math.round(rect.width) || 540;
      if (w < 20) return;

      const pad = Math.ceil(this.borderWidth / 2) + 6;
      const geom = buildGeometry(w, this.bend, this.height, pad);
      this.geom = geom;

      const T = this.height;
      const btnInset = Math.max(5, this.borderWidth + 4);
      const chipH = Math.min(34, Math.max(16, T * 0.34));
      const chipW = chipH * 1.25;
      const iconU = 22 + chipW / 2;
      const textStartU = this.showIcon ? 22 + chipW + 13 : 24;
      const btnW = this.showButton ? Math.max(this.btnTextW + this.fontSize * 2.7, T * 1.35) : 0;
      const btnU1 = geom.W - btnInset;
      const btnU0 = btnU1 - btnW;
      const textEndU = Math.max(textStartU + 20, this.showButton ? btnU0 - 14 : geom.W - 24);
      const winLen = (textEndU - textStartU) / geom.uPerLen;

      this.layout = { btnInset, chipH, chipW, iconU, textStartU, textEndU, btnU0, btnU1, winLen };

      const colors = this.getColors();
      const vBase = this.fontSize * 0.34;
      const scrollU = this.scrollLen * geom.uPerLen;
      const bandPath = bentRectPath(geom, 0, geom.W, -T / 2, T / 2, this.cornerRadius);
      const layoutPath = bentLinePath(geom, textStartU - scrollU, geom.W, vBase);
      const clipPath = bentRectPath(geom, textStartU - 6, textEndU + 8, -T / 2, T / 2, 0);

      const [ix, iy] = geom.point(iconU, 0);
      const iconAngle = geom.angleAt(iconU);
      const ew = chipW * 0.5;
      const eh = chipH * 0.5;
      const sw = Math.max(1.1, chipH * 0.075);

      const caretU = textStartU + (this.caretIndex * 8.5) * geom.uPerLen; // estimate or refined by substring
      const [caretX, caretY] = geom.point(caretU, 0);
      const caretAngle = geom.angleAt(caretU);
      const caretH = Math.min(T * 0.58, this.fontSize * 1.45);

      const btnH = T - btnInset * 2;
      const buttonPath = this.showButton
        ? bentRectPath(geom, btnU0, btnU1, -T / 2 + btnInset, T / 2 - btnInset, Math.min(this.cornerRadius * 0.72, btnH / 2))
        : '';
      const buttonTextPath = this.showButton ? bentLinePath(geom, btnU0, btnU1, vBase) : '';

      const shadow = SHADOWS[this.shadowSize];
      const svgStyle = shadow
        ? `filter: drop-shadow(0 ${shadow[0]}px ${shadow[1]}px ${hexToRgba(colors.shColor, shadow[2])});`
        : '';

      const val = this.innerValue;

      this.svg.setAttribute('width', String(geom.W));
      this.svg.setAttribute('height', String(round2(geom.svgH)));
      this.svg.setAttribute('viewBox', `0 0 ${geom.W} ${round2(geom.svgH)}`);
      this.svg.setAttribute('style', svgStyle);

      this.svg.innerHTML = `
        <defs>
          <clipPath id="${this.clipId}">
            <path d="${clipPath}" />
          </clipPath>
        </defs>

        <path class="curved-input__ring" d="${bandPath}" fill="none" stroke="${colors.accentColor}" stroke-width="${this.borderWidth + 6}" />
        <path d="${bandPath}" fill="${colors.bgColor}" stroke="${colors.strokeColor}" stroke-width="${this.borderWidth}" />

        <path id="${this.layoutPathId}" d="${layoutPath}" fill="none" />

        ${this.showIcon ? `
          <g transform="translate(${round2(ix)} ${round2(iy)}) rotate(${round2(iconAngle)})" aria-hidden="true">
            <rect x="${-chipW / 2}" y="${-chipH / 2}" width="${chipW}" height="${chipH}" rx="${chipH * 0.27}" fill="${colors.accentColor}" />
            <rect x="${-ew / 2}" y="${-eh / 2}" width="${ew}" height="${eh}" rx="1.4" fill="none" stroke="#05070c" stroke-width="${sw}" stroke-linejoin="round" />
            <path d="M ${round2(-ew / 2)} ${round2(-eh / 2 + sw * 0.4)} L 0 ${round2(eh * 0.14)} L ${round2(ew / 2)} ${round2(-eh / 2 + sw * 0.4)}" fill="none" stroke="#05070c" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" />
          </g>
        ` : ''}

        <g clip-path="url(#${this.clipId})">
          <text class="curved-input__text" style="font-size: ${this.fontSize}px; font-weight: 500;" fill="${colors.fgColor}" xml:space="preserve" aria-hidden="true">
            <textPath href="#${this.layoutPathId}">${val}</textPath>
          </text>
          ${!val && this.placeholder ? `
            <text class="curved-input__placeholder" style="font-size: ${this.fontSize}px; font-weight: 500;" fill="${colors.phColor}" xml:space="preserve" aria-hidden="true">
              <textPath href="#${this.layoutPathId}">${this.placeholder}</textPath>
            </text>
          ` : ''}
          ${this.focused ? `
            <g class="curved-input__caret" transform="translate(${round2(caretX)} ${round2(caretY)}) rotate(${round2(caretAngle)})">
              <line y1="${-caretH / 2}" y2="${caretH / 2}" stroke="${colors.fgColor}" stroke-width="1.6" stroke-linecap="round">
                <animate attributeName="opacity" values="1;0" dur="1.06s" calcMode="discrete" repeatCount="indefinite" />
              </line>
            </g>
          ` : ''}
        </g>

        ${this.showButton ? `
          <g class="curved-input__button" role="button" tabindex="0" aria-label="${this.buttonText}">
            <path class="curved-input__button-bg" d="${buttonPath}" fill="${colors.accentColor}" />
            <path id="${this.buttonPathId}" d="${buttonTextPath}" fill="none" />
            <text fill="${colors.btnFgColor}" text-anchor="middle" style="font-size: ${this.fontSize}px; font-weight: 600; pointer-events: none;">
              <textPath href="#${this.buttonPathId}" startOffset="50%">${this.buttonText}</textPath>
            </text>
          </g>
        ` : ''}
      `;

      // Measure button text accurately
      const btnGroup = this.svg.querySelector('.curved-input__button');
      if (btnGroup) {
        btnGroup.addEventListener('click', e => {
          e.stopPropagation();
          this.submit();
        });
        btnGroup.addEventListener('pointerdown', e => e.stopPropagation());
        btnGroup.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.submit();
          }
        });
      }
    }

    initEvents() {
      const onResize = () => this.render();
      window.addEventListener('resize', onResize);

      this.input.addEventListener('input', e => {
        this.innerValue = e.target.value;
        this.caretIndex = e.target.selectionStart || e.target.value.length;
        this.render();
        const ev = new CustomEvent('curved-input-change', { detail: { value: this.innerValue } });
        this.container.dispatchEvent(ev);
      });

      this.input.addEventListener('focus', () => {
        this.focused = true;
        this.container.classList.add('curved-input--focused');
        this.render();
      });

      this.input.addEventListener('blur', () => {
        this.focused = false;
        this.container.classList.remove('curved-input--focused');
        this.render();
      });

      this.input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submit();
        }
      });

      this.svg.addEventListener('pointerdown', e => {
        if (e.target.closest('.curved-input__button')) {
          return; // Let button receive interaction
        }
        e.preventDefault();
      });

      this.svg.addEventListener('click', e => {
        const btn = e.target.closest('.curved-input__button');
        if (btn) {
          e.stopPropagation();
          this.submit();
          return;
        }
        this.input.focus();
      });

      // Theme toggle observer
      const themeObserver = new MutationObserver(() => {
        this.render();
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    submit() {
      const val = this.innerValue.trim();
      const feedback = document.getElementById('quick-feedback');

      if (!val) {
        this.input.focus();
        return;
      }

      if (feedback) {
        feedback.style.display = 'block';
        feedback.innerHTML = '<strong>Message Dispatched!</strong> Thank you for reaching out. I\'ll get back to you shortly.';
      }

      this.clear();

      const ev = new CustomEvent('curved-input-submit', {
        detail: { value: val },
        bubbles: true,
        cancelable: true
      });
      this.container.dispatchEvent(ev);

      if (typeof global.handleQuickConnect === 'function') {
        global.handleQuickConnect(val);
      }
    }

    getValue() {
      return this.innerValue;
    }

    setValue(val) {
      this.innerValue = val;
      this.input.value = val;
      this.render();
    }

    clear() {
      this.setValue('');
    }
  }

  function initCurvedInputs() {
    const elements = document.querySelectorAll('.curved-input-widget, [data-curved-input="true"]');
    elements.forEach(el => {
      if (!el.__curvedInputInstance) {
        el.__curvedInputInstance = new CurvedInputElement(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCurvedInputs);
  } else {
    initCurvedInputs();
  }

  global.CurvedInput = {
    init: initCurvedInputs,
    CurvedInputElement
  };

})(typeof window !== 'undefined' ? window : this);
