/**
 * VariableProximity - Vanilla JS Runtime (React Bits Integration)
 * High-performance variable font weight & optical size interpolation
 * reacting dynamically to mouse cursor proximity.
 */
(function() {
  'use strict';

  const parseSettings = settingsStr => {
    const map = new Map();
    if (!settingsStr) return map;
    settingsStr
      .split(',')
      .map(s => s.trim())
      .forEach(s => {
        const [name, value] = s.split(' ');
        if (name && value !== undefined) {
          map.set(name.replace(/['"]/g, ''), parseFloat(value));
        }
      });
    return map;
  };

  const calculateDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const calculateFalloff = (distance, radius, type) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
    switch (type) {
      case 'exponential':
        return norm ** 2;
      case 'gaussian':
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      case 'linear':
      default:
        return norm;
    }
  };

  class VariableProximityInstance {
    constructor(element, options = {}) {
      this.element = element;
      if (!this.element || this.element._vpInstance) return;
      this.element._vpInstance = this;

      const ds = element.dataset || {};
      this.fromFont = options.fromFont || ds.fromFont || "'wght' 400, 'opsz' 9";
      this.toFont = options.toFont || ds.toFont || "'wght' 900, 'opsz' 40";
      this.radius = options.radius ?? (ds.radius ? parseFloat(ds.radius) : 120);
      this.falloff = options.falloff || ds.falloff || 'linear';

      // Container for coordinates (default to closest section or offsetParent or window)
      this.container = element.closest('.section') || element.closest('.section-header') || element.parentElement || document.body;

      this.parsedSettings = this.computeSettingsMap();
      this.mouse = { x: -9999, y: -9999, active: false };
      this.lastMouse = { x: null, y: null };
      this.letters = [];
      this.rafId = null;

      this.initDOM();
      this.initEvents();
      this.startLoop();
    }

    computeSettingsMap() {
      const fromMap = parseSettings(this.fromFont);
      const toMap = parseSettings(this.toFont);
      const entries = [];
      fromMap.forEach((fromValue, axis) => {
        entries.push({
          axis,
          fromValue,
          toValue: toMap.has(axis) ? toMap.get(axis) : fromValue
        });
      });
      return entries;
    }

    initDOM() {
      const originalText = this.element.textContent.trim();
      this.element.innerHTML = '';
      this.element.classList.add('variable-proximity');

      const words = originalText.split(/\s+/);
      let globalIdx = 0;

      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        const chars = word.split('');
        chars.forEach(char => {
          const letterSpan = document.createElement('span');
          letterSpan.className = 'vp-letter';
          letterSpan.style.display = 'inline-block';
          letterSpan.style.fontVariationSettings = this.fromFont;
          letterSpan.textContent = char;
          letterSpan.setAttribute('aria-hidden', 'true');
          wordSpan.appendChild(letterSpan);

          this.letters.push({
            el: letterSpan,
            idx: globalIdx++
          });
        });

        this.element.appendChild(wordSpan);

        if (wIdx < words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.style.display = 'inline-block';
          spaceSpan.innerHTML = '&nbsp;';
          this.element.appendChild(spaceSpan);
        }
      });

      // Accessible screen-reader text
      const srSpan = document.createElement('span');
      srSpan.className = 'sr-only';
      srSpan.textContent = originalText;
      this.element.appendChild(srSpan);
    }

    initEvents() {
      const updatePos = (clientX, clientY) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = clientX - rect.left;
        this.mouse.y = clientY - rect.top;
        this.mouse.active = true;
      };

      this.onMouseMove = e => updatePos(e.clientX, e.clientY);
      this.onTouchMove = e => {
        if (e.touches && e.touches[0]) {
          updatePos(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      this.onMouseLeave = () => {
        this.mouse.active = false;
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      };

      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      window.addEventListener('touchmove', this.onTouchMove, { passive: true });
      this.container.addEventListener('mouseleave', this.onMouseLeave, { passive: true });
    }

    startLoop() {
      const loop = () => {
        const containerRect = this.container.getBoundingClientRect();

        // Check if mouse moved or container scrolled
        if (this.lastMouse.x !== this.mouse.x || this.lastMouse.y !== this.mouse.y) {
          this.lastMouse.x = this.mouse.x;
          this.lastMouse.y = this.mouse.y;

          for (let i = 0; i < this.letters.length; i++) {
            const item = this.letters[i];
            const letterEl = item.el;
            if (!letterEl) continue;

            const rect = letterEl.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
            const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

            const distance = calculateDistance(
              this.mouse.x,
              this.mouse.y,
              letterCenterX,
              letterCenterY
            );

            if (distance >= this.radius || !this.mouse.active) {
              if (letterEl._curFont !== this.fromFont) {
                letterEl.style.fontVariationSettings = this.fromFont;
                letterEl._curFont = this.fromFont;
              }
              continue;
            }

            const falloffVal = calculateFalloff(distance, this.radius, this.falloff);
            const newSettings = this.parsedSettings
              .map(({ axis, fromValue, toValue }) => {
                const interp = fromValue + (toValue - fromValue) * falloffVal;
                return `'${axis}' ${Math.round(interp * 10) / 10}`;
              })
              .join(', ');

            if (letterEl._curFont !== newSettings) {
              letterEl.style.fontVariationSettings = newSettings;
              letterEl._curFont = newSettings;
            }
          }
        }

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('touchmove', this.onTouchMove);
      if (this.container) {
        this.container.removeEventListener('mouseleave', this.onMouseLeave);
      }
      this.element._vpInstance = null;
    }
  }

  // Global Registry & Auto-Initialization
  window.VariableProximity = VariableProximityInstance;

  function initAllVariableProximity() {
    const targets = document.querySelectorAll('[data-variable-proximity="true"], .variable-proximity');
    targets.forEach(el => {
      if (!el._vpInstance) {
        new VariableProximityInstance(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllVariableProximity);
  } else {
    initAllVariableProximity();
  }
})();
