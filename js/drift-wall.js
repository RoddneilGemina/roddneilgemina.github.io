/**
 * DriftWall Component (Vanilla JavaScript + CSS 3D Perspective Implementation)
 * Based on React Bits <DriftWall /> component.
 * Features:
 * - Endless 3D perspective wall of tiles with alternating drift column speeds
 * - Tiles lift towards viewer on hover with glowing border and un-dimmed saturation
 * - Dampened pointer parallax tracking on the 3D perspective plane
 * - Integrated with portfolio project detail modals via data-project triggers
 * - IntersectionObserver liveness tracking for optimal 60fps performance
 */

(function (global) {
  'use strict';

  const DEFAULT_PROJECT_ITEMS = [
    {
      image: 'images/resutex.png',
      title: 'ResuTex',
      badge: 'LaTeX ATS Studio',
      projectId: 'p13'
    },
    {
      image: 'images/aicquire.png',
      title: 'aicquire',
      badge: 'AI Hiring ATS',
      projectId: 'p12'
    },
    {
      image: 'images/fusionrush.jpg',
      title: 'Fusion Rush',
      badge: "ICETT '26",
      projectId: 'p1'
    },
    {
      image: 'images/visualai.jpg',
      title: 'Visual AI Proof Parser',
      badge: "PCSC '26",
      projectId: 'p2'
    },
    {
      image: 'images/refertoire.png',
      title: 'Refertoire PWA',
      badge: '100% Offline PWA',
      projectId: 'p9'
    },
    {
      image: 'images/gigipos.png',
      title: 'GigiPOS Platform',
      badge: 'Modern Retail POS',
      projectId: 'p10'
    },
    {
      image: 'images/whatswap.png',
      title: 'WhatSwap?!',
      badge: 'P2P Barter & Bids',
      projectId: 'p11'
    },
    {
      image: 'images/nexchef.png',
      title: 'Nexchef Kitchen',
      badge: 'Mobile Culinary',
      projectId: 'p8'
    },
    {
      image: 'images/takeit.png',
      title: 'TakeIt QR Tickets',
      badge: 'Crypto Tickets',
      projectId: 'p3'
    },
    {
      image: 'images/dishcover.png',
      title: 'DishCover',
      badge: 'Smart Pantry AI',
      projectId: 'p4'
    },
    {
      image: 'images/cropconnect.png',
      title: 'CropConnect',
      badge: 'AgriTech PWA',
      projectId: 'p5'
    },
    {
      image: 'images/bomberman.png',
      title: 'Bomberman Java',
      badge: 'Game Systems',
      projectId: 'p6'
    }
  ];

  const columnFactor = (index, variance) => {
    const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
    return 1 + variance * pseudo;
  };

  class DriftWallInstance {
    constructor(element, options = {}) {
      this.container = element;
      this.container._driftWallInstance = this;

      const ds = element.dataset || {};
      this.options = {
        columns: parseInt(options.columns ?? ds.columns ?? 5, 10),
        speed: parseFloat(options.speed ?? ds.speed ?? 42),
        direction: options.direction || ds.direction || 'up',
        variance: parseFloat(options.variance ?? ds.variance ?? 0.45),
        tilt: parseFloat(options.tilt ?? ds.tilt ?? 16),
        turn: parseFloat(options.turn ?? ds.turn ?? -14),
        roll: parseFloat(options.roll ?? ds.roll ?? 0),
        depth: parseFloat(options.depth ?? ds.depth ?? 120),
        perspective: parseFloat(options.perspective ?? ds.perspective ?? 1200),
        lift: parseFloat(options.lift ?? ds.lift ?? 64),
        parallax: parseFloat(options.parallax ?? ds.parallax ?? 0.6),
        pauseOnHover: options.pauseOnHover ?? (ds.pauseOnHover === 'true'),
        dim: parseFloat(options.dim ?? ds.dim ?? 0.55),
        fade: parseFloat(options.fade ?? ds.fade ?? 0.6),
        gap: parseFloat(options.gap ?? ds.gap ?? 18),
        tileWidth: parseFloat(options.tileWidth ?? ds.tileWidth ?? 200),
        tileHeight: parseFloat(options.tileHeight ?? ds.tileHeight ?? 132),
        radius: parseFloat(options.radius ?? ds.radius ?? 16),
        grayscale: options.grayscale ?? (ds.grayscale === 'true'),
        overlayColor: options.overlayColor || ds.overlayColor || '#060010'
      };

      // Load custom items if present in data-script or options
      const scriptData = element.querySelector('script[type="application/json"]');
      if (scriptData) {
        try {
          this.items = JSON.parse(scriptData.textContent);
        } catch (e) {
          this.items = options.items || DEFAULT_PROJECT_ITEMS;
        }
      } else {
        this.items = options.items || DEFAULT_PROJECT_ITEMS;
      }

      this.init();
    }

    init() {
      const container = this.container;
      const opts = this.options;
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

      // Apply CSS custom properties
      container.style.setProperty('--dw-tile-w', `${opts.tileWidth}px`);
      container.style.setProperty('--dw-tile-h', `${opts.tileHeight}px`);
      container.style.setProperty('--dw-gap', `${opts.gap}px`);
      container.style.setProperty('--dw-radius', `${opts.radius}px`);
      container.style.setProperty('--dw-perspective', `${opts.perspective}px`);
      container.style.setProperty('--dw-lift', `${opts.lift}px`);
      container.style.setProperty('--dw-dim', opts.dim);
      container.style.setProperty('--dw-gray', opts.grayscale ? 1 : 0);
      container.style.setProperty('--dw-overlay', opts.overlayColor);
      container.style.setProperty('--dw-edge', `${Math.max(0, (1 - opts.fade) * 100)}%`);

      container.classList.add('drift-wall');
      if (reducedMotion) container.classList.add('drift-wall--reduced');

      // Create 3D Plane
      const plane = document.createElement('div');
      plane.className = 'drift-wall__plane';
      container.innerHTML = '';
      container.appendChild(plane);
      this.plane = plane;

      const numCols = opts.columns;
      const numItems = this.items.length;
      const colItems = Array.from({ length: numCols }, () => []);

      // Properly distribute projects across columns so that:
      // - Every column gets at least 4 distinct projects (eliminating single-item repetition)
      // - Consecutive columns start at varied offsets
      // - All projects get balanced showcase across the drift wall
      const itemsPerCol = Math.max(4, Math.ceil(numItems / 2));
      for (let c = 0; c < numCols; c++) {
        const used = new Set();
        let cursor = (c * 2) % numItems;
        while (colItems[c].length < itemsPerCol) {
          const item = this.items[cursor % numItems];
          if (!used.has(item.projectId || item.title) || used.size >= numItems) {
            colItems[c].push(item);
            used.add(item.projectId || item.title);
          }
          cursor = (cursor + 1) % numItems;
        }
      }
      const finalizedCols = colItems.map(c => (c.length ? c : this.items.slice(0, 1)));

      let containerH = container.offsetHeight || 540;
      const unit = opts.tileHeight + opts.gap;
      const colMeta = finalizedCols.map(col => {
        const copyHeight = Math.max(unit, col.length * unit);
        const copies = Math.max(2, Math.ceil((containerH * 1.6) / copyHeight) + 1);
        return { copyHeight, copies };
      });

      const dirSign = opts.direction === 'up' ? 1 : -1;
      const baseVelocities = finalizedCols.map((_, c) => {
        const altSign = c % 2 === 0 ? 1 : -1;
        return opts.speed * columnFactor(c, opts.variance) * dirSign * altSign;
      });

      const offsets = colMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
      const velocities = finalizedCols.map(() => 0);
      const trackEls = [];

      // Build DOM structure
      finalizedCols.forEach((col, c) => {
        const colEl = document.createElement('div');
        colEl.className = 'drift-wall__col';

        const trackEl = document.createElement('div');
        trackEl.className = 'drift-wall__track';

        const meta = colMeta[c];
        for (let copyIdx = 0; copyIdx < meta.copies; copyIdx++) {
          col.forEach((item, itemIdx) => {
            const tileId = `${c}-${copyIdx}-${itemIdx}`;
            const tile = document.createElement('div');
            tile.className = 'drift-wall__tile open-modal-btn';
            tile.setAttribute('tabindex', '0');
            tile.setAttribute('role', 'button');
            tile.setAttribute('aria-label', `View ${item.title || 'Project'}`);
            tile.dataset.tileId = tileId;
            tile.dataset.col = c;
            if (item.projectId) {
              tile.dataset.project = item.projectId;
              tile.dataset.projectId = item.projectId;
            }

            const inner = document.createElement('span');
            inner.className = 'drift-wall__inner';

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title || '';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.draggable = false;
            inner.appendChild(img);

            if (item.badge) {
              const badge = document.createElement('span');
              badge.className = 'drift-wall__badge';
              badge.textContent = item.badge;
              inner.appendChild(badge);
            }

            if (item.title) {
              const caption = document.createElement('span');
              caption.className = 'drift-wall__caption';
              caption.textContent = item.title;
              inner.appendChild(caption);
            }

            const overlay = document.createElement('span');
            overlay.className = 'drift-wall__overlay';
            overlay.setAttribute('aria-hidden', 'true');
            inner.appendChild(overlay);
            tile.appendChild(inner);

            tile.addEventListener('pointerenter', () => {
              if (activeTile && activeTile !== tile) {
                activeTile.classList.remove('is-active');
              }
              activeTile = tile;
              tile.classList.add('is-active');
              hoveredCol = c;
            });

            tile.addEventListener('pointerleave', () => {
              tile.classList.remove('is-active');
              if (activeTile === tile) {
                activeTile = null;
                hoveredCol = -1;
              }
            });

            // Wire click to global project modal if present
            tile.addEventListener('click', e => {
              if (item.projectId && typeof global.openProjectModal === 'function') {
                e.stopPropagation();
                global.openProjectModal(item.projectId);
              }
            });

            tile.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (item.projectId && typeof global.openProjectModal === 'function') {
                  global.openProjectModal(item.projectId);
                }
              }
            });

            trackEl.appendChild(tile);
          });
        }

        colEl.appendChild(trackEl);
        plane.appendChild(colEl);
        trackEls.push(trackEl);
      });

      // Pointer state & animation variables
      let activeTile = null;
      let hoveredCol = -1;
      let wallHovered = false;
      const pointer = { x: 0, y: 0 };
      const pointerDamped = { x: 0, y: 0 };
      let lastTs = null;
      let rafId = null;
      let isVisible = true;

      const applyPlaneTransform = (px, py) => {
        plane.style.transform =
          `translate(-50%, -50%) scale(1.02) ` +
          `rotateX(${opts.tilt + py}deg) rotateY(${opts.turn + px}deg) rotateZ(${opts.roll}deg) ` +
          `translateZ(${-opts.depth}px)`;
      };

      const animate = ts => {
        if (lastTs === null) lastTs = ts;
        const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
        lastTs = ts;

        const maxTilt = opts.parallax * 8;
        const targetX = pointer.x * maxTilt;
        const targetY = -pointer.y * maxTilt;
        const damp = 1 - Math.exp(-dt / 0.12);
        pointerDamped.x += (targetX - pointerDamped.x) * damp;
        pointerDamped.y += (targetY - pointerDamped.y) * damp;
        applyPlaneTransform(pointerDamped.x, pointerDamped.y);

        if (!reducedMotion) {
          for (let c = 0; c < trackEls.length; c++) {
            const meta = colMeta[c];
            if (!meta) continue;
            const paused = wallHovered && opts.pauseOnHover;
            const factor = paused ? 0 : (hoveredCol === c ? 0.35 : 1);
            const target = baseVelocities[c] * factor;

            const ease = 1 - Math.exp(-dt / (target === 0 ? 0.2 : 0.36));
            velocities[c] += (target - velocities[c]) * ease;
            let next = (offsets[c] ?? 0) + velocities[c] * dt;
            next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
            offsets[c] = next;

            const el = trackEls[c];
            if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
          }
        }

        if (isVisible) {
          rafId = requestAnimationFrame(animate);
        }
      };

      // Pointer event handlers
      const onPointerMove = e => {
        const rect = container.getBoundingClientRect();
        if (!rect) return;
        if (opts.parallax > 0 && !reducedMotion) {
          pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
          pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
        }
        const targetTile = (e.target && e.target.closest) ? e.target.closest('.drift-wall__tile') : null;
        if (targetTile && targetTile !== activeTile) {
          if (activeTile) activeTile.classList.remove('is-active');
          activeTile = targetTile;
          activeTile.classList.add('is-active');
          hoveredCol = parseInt(targetTile.dataset.col, 10);
        }
      };

      const onPointerEnter = () => {
        wallHovered = true;
      };

      const onPointerLeave = () => {
        wallHovered = false;
        pointer.x = 0;
        pointer.y = 0;
        if (activeTile) {
          activeTile.classList.remove('is-active');
          activeTile = null;
        }
        hoveredCol = -1;
      };

      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerenter', onPointerEnter);
      container.addEventListener('pointerleave', onPointerLeave);

      // Intersection Observer to stop raf when offscreen
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) {
          lastTs = performance.now();
          rafId = requestAnimationFrame(animate);
        } else if (!isVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
      observer.observe(container);

      // Resize observer
      const resizeObserver = new ResizeObserver(([entry]) => {
        containerH = entry.contentRect.height || 540;
      });
      resizeObserver.observe(container);

      lastTs = performance.now();
      rafId = requestAnimationFrame(animate);

      this.destroy = () => {
        if (rafId) cancelAnimationFrame(rafId);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerenter', onPointerEnter);
        container.removeEventListener('pointerleave', onPointerLeave);
        observer.disconnect();
        resizeObserver.disconnect();
      };
    }
  }

  global.DriftWall = DriftWallInstance;

  function initAllDriftWalls() {
    const walls = document.querySelectorAll('[data-drift-wall="true"], .drift-wall-container');
    walls.forEach(el => {
      if (!el._driftWallInstance) {
        new DriftWallInstance(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllDriftWalls);
  } else {
    initAllDriftWalls();
  }
})(typeof window !== 'undefined' ? window : this);
