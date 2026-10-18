/**
 * BorderGlow Component (Vanilla JavaScript + CSS Ray-Traced Implementation)
 * Based on React Bits <BorderGlow /> component.
 * Features:
 * - Directional edge proximity calculation with cone-spread mask
 * - Angle-following ray-traced mesh gradient border and soft ambient edge lighting
 * - Configurable HSL glow color, intensity, and gradient stops
 * - Optional intro sweep animation on mount
 * - Accessible and light/dark theme aware
 */

(function (global) {
  'use strict';

  function parseHSL(hslStr) {
    if (!hslStr) return { h: 185, s: 100, l: 60 };
    const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!match) return { h: 185, s: 100, l: 60 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function applyGlowVars(card, glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    for (let i = 0; i < opacities.length; i++) {
      card.style.setProperty(`--glow-color${keys[i]}`, `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`);
    }
  }

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function applyGradientVars(card, colors) {
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      card.style.setProperty(GRADIENT_KEYS[i], `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
    }
    card.style.setProperty('--gradient-base', `linear-gradient(${colors[0]} 0 100%)`);
  }

  function isLightColor(color) {
    if (!color) return false;
    const value = color.trim().replace('#', '');
    if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
    const hex = value.length === 3 ? value.split('').map(char => char + char).join('') : value;
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
  }

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x) { return x * x * x; }

  function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
    const t0 = performance.now() + delay;
    function tick() {
      const elapsed = performance.now() - t0;
      const t = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    }
    setTimeout(() => requestAnimationFrame(tick), delay);
  }

  function getCenterOfElement(el) {
    const rect = el.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }

  function getEdgeProximity(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function createBorderGlow(card, options = {}) {
    if (!card || card.__borderGlowInit) return null;
    card.__borderGlowInit = true;

    // Read attributes or fallback
    const edgeSensitivity = options.edgeSensitivity !== undefined ? options.edgeSensitivity : (parseFloat(card.dataset.edgeSensitivity) || 30);
    const glowColor = options.glowColor || card.dataset.glowColor || '185 100 65';
    const backgroundColor = options.backgroundColor || card.dataset.bgColor || card.dataset.backgroundColor || '#080e1c';
    const borderRadius = options.borderRadius !== undefined ? options.borderRadius : (parseFloat(card.dataset.borderRadius) || 28);
    const glowRadius = options.glowRadius !== undefined ? options.glowRadius : (parseFloat(card.dataset.glowRadius) || 40);
    const glowIntensity = options.glowIntensity !== undefined ? options.glowIntensity : (parseFloat(card.dataset.glowIntensity) || 1.1);
    const coneSpread = options.coneSpread !== undefined ? options.coneSpread : (parseFloat(card.dataset.coneSpread) || 25);
    const fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : (parseFloat(card.dataset.fillOpacity) || 0.45);
    const animated = options.animated !== undefined ? options.animated : (card.dataset.animated === 'true' || card.dataset.borderGlowAnimated === 'true');

    // Parse colors
    let colors = options.colors;
    if (!colors && card.dataset.colors) {
      colors = card.dataset.colors.split(',').map(s => s.trim());
    } else if (!colors && card.dataset.glowColors) {
      colors = card.dataset.glowColors.split(',').map(s => s.trim());
    }
    if (!colors || colors.length < 3) {
      colors = ['#00f0ff', '#8b5cf6', '#38bdf8'];
    }

    if (!card.classList.contains('border-glow-card')) {
      card.classList.add('border-glow-card');
    }

    if (isLightColor(backgroundColor)) {
      card.classList.add('border-glow-card--light');
    }

    // Set core CSS variables
    card.style.setProperty('--card-bg', backgroundColor);
    card.style.setProperty('--edge-sensitivity', edgeSensitivity);
    card.style.setProperty('--border-radius', `${borderRadius}px`);
    card.style.setProperty('--glow-padding', `${glowRadius}px`);
    card.style.setProperty('--cone-spread', coneSpread);
    card.style.setProperty('--fill-opacity', fillOpacity);

    applyGlowVars(card, glowColor, glowIntensity);
    applyGradientVars(card, colors);

    // Ensure edge-light span exists
    let edgeLight = card.querySelector(':scope > .edge-light');
    if (!edgeLight) {
      edgeLight = document.createElement('span');
      edgeLight.className = 'edge-light';
      card.appendChild(edgeLight);
    }

    // Wrap inner content if not wrapped
    let inner = card.querySelector(':scope > .border-glow-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'border-glow-inner';
      const nodes = Array.from(card.childNodes).filter(node => node !== edgeLight);
      nodes.forEach(node => inner.appendChild(node));
      card.insertBefore(inner, edgeLight);
    }

    const handlePointerMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    };

    const handlePointerLeave = () => {
      card.style.setProperty('--edge-proximity', '0');
    };

    card.addEventListener('pointermove', handlePointerMove, { passive: true });
    card.addEventListener('pointerleave', handlePointerLeave);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (animated && !reducedMotion) {
      const angleStart = 110;
      const angleEnd = 465;
      card.classList.add('sweep-active');
      card.style.setProperty('--cursor-angle', `${angleStart}deg`);

      animateValue({ duration: 500, onUpdate: v => card.style.setProperty('--edge-proximity', v) });
      animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
      }});
      animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
      }});
      animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
        onUpdate: v => card.style.setProperty('--edge-proximity', v),
        onEnd: () => card.classList.remove('sweep-active'),
      });
    }

    return {
      card,
      destroy: () => {
        card.removeEventListener('pointermove', handlePointerMove);
        card.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  }

  function initBorderGlow() {
    const targets = document.querySelectorAll('[data-border-glow="true"], .border-glow-card');
    targets.forEach(el => createBorderGlow(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBorderGlow);
  } else {
    initBorderGlow();
  }

  global.createBorderGlow = createBorderGlow;
  global.initBorderGlow = initBorderGlow;
})(window);
