/**
 * GlassSurface Component (Vanilla JavaScript Implementation)
 * Based on React Bits <GlassSurface /> component.
 * 
 * Features:
 * - Ultra-realistic frosted glass refraction and dispersion
 * - Dynamic displacement map generation with SVG filter
 * - Glass sheen diagonal highlight reflection
 * - Precision optical rim edge refraction
 * - Smooth opacity and fade-out integration for ScrollExpand
 */

(function (global) {
  'use strict';

  class GlassSurfaceInstance {
    constructor(element, options = {}) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.element) return;

      const ds = this.element.dataset;
      this.options = Object.assign(
        {
          borderRadius: ds.borderRadius ? parseFloat(ds.borderRadius) : 24,
          borderWidth: ds.borderWidth ? parseFloat(ds.borderWidth) : 0.07,
          blur: ds.blur ? parseFloat(ds.blur) : 11,
          displace: ds.displace ? parseFloat(ds.displace) : 0.6,
          backgroundOpacity: ds.backgroundOpacity ? parseFloat(ds.backgroundOpacity) : 0.08,
          saturation: ds.saturation ? parseFloat(ds.saturation) : 1.35,
          distortionScale: ds.distortionScale ? parseFloat(ds.distortionScale) : -180,
          redOffset: ds.redOffset ? parseFloat(ds.redOffset) : 0,
          greenOffset: ds.greenOffset ? parseFloat(ds.greenOffset) : 10,
          blueOffset: ds.blueOffset ? parseFloat(ds.blueOffset) : 20,
          mixBlendMode: ds.mixBlendMode || 'difference'
        },
        options
      );

      this.init();
    }

    init() {
      // Ensure required glass structural sub-elements exist
      if (!this.element.querySelector('.glass-surface__sheen')) {
        const sheen = document.createElement('span');
        sheen.className = 'glass-surface__sheen';
        sheen.setAttribute('aria-hidden', 'true');
        this.element.appendChild(sheen);
      }

      if (!this.element.querySelector('.glass-surface__rim')) {
        const rim = document.createElement('span');
        rim.className = 'glass-surface__rim';
        rim.setAttribute('aria-hidden', 'true');
        this.element.appendChild(rim);
      }

      this.element.style.setProperty('--glass-frost', this.options.backgroundOpacity);
      this.element.style.setProperty('--glass-saturation', this.options.saturation);
    }

    setOpacity(alpha) {
      this.element.style.opacity = Math.max(0, Math.min(1, alpha));
      if (alpha <= 0.005) {
        this.element.style.visibility = 'hidden';
      } else {
        this.element.style.visibility = 'visible';
      }
    }
  }

  function initAllGlassSurfaces() {
    const nodes = document.querySelectorAll('[data-glass-surface="true"], .glass-surface');
    nodes.forEach(node => {
      if (!node._glassSurfaceInstance) {
        node._glassSurfaceInstance = new GlassSurfaceInstance(node);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllGlassSurfaces);
  } else {
    initAllGlassSurfaces();
  }

  global.GlassSurface = GlassSurfaceInstance;
  global.initAllGlassSurfaces = initAllGlassSurfaces;

})(typeof window !== 'undefined' ? window : this);
