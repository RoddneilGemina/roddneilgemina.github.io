/**
 * GridMotion Component (Vanilla JavaScript + CSS Implementation)
 * Based on React Bits <GridMotion /> component.
 * Features:
 * - Drifting angled grid of tiles with alternating horizontal motion
 * - Dynamic spotlight tracking with smooth Gaussian falloff & un-dimming
 * - Pointer parallax shifting across rows with physics-based inertia
 * - Feathered multi-stop linear gradient masking for smooth edge dissipation
 * - Full integration with portfolio project modals via data-project triggers
 * - Zero CPU waste when offscreen (IntersectionObserver auto-pause)
 */

(function (global) {
  'use strict';

  const THEMES = {
    dark: {
      tile: '#141313',
      text: 'rgba(237, 234, 228, 0.88)',
      border: 'rgba(255, 255, 255, 0.08)'
    },
    light: {
      tile: '#f4f4f5',
      text: '#3f3f46',
      border: 'rgba(24, 24, 27, 0.08)'
    }
  };

  const DIRECTIONS = ['alternate', 'left', 'right'];
  const IMAGE = /^(https?:\/\/|\/\/|\/|\.\.?\/|data:image\/|blob:)|\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;
  const INERTIA = [0.42, 0.32, 0.26, 0.22];
  const PACE = [1, 0.86, 1.12, 0.94];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrap = (value, total) => ((value % total) + total) % total;
  const smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const feather = (side, zone) => {
    const stops = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);
      stops.push(`rgba(0, 0, 0, ${alpha.toFixed(4)}) ${(t * zone).toFixed(2)}%`);
    }
    const mirrored = stops.map((_, i) => {
      const t = (12 - i) / 12;
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);
      return `rgba(0, 0, 0, ${alpha.toFixed(4)}) ${(100 - t * zone).toFixed(2)}%`;
    });
    return `linear-gradient(${side}, ${stops.join(', ')}, ${mirrored.join(', ')})`;
  };

  const featherTop = (zone) => {
    const stops = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);
      stops.push(`rgba(0, 0, 0, ${alpha.toFixed(4)}) ${(t * zone).toFixed(2)}%`);
    }
    stops.push(`rgba(0, 0, 0, 1) 100%`);
    return `linear-gradient(to bottom, ${stops.join(', ')})`;
  };

  const toTile = (item) => {
    if (item === null || item === undefined || item === false) return { kind: 'empty' };
    if (typeof item === 'object') {
      const imgSrc = item.src || item.image;
      if (typeof imgSrc === 'string') {
        return {
          kind: 'image',
          src: imgSrc,
          alt: item.alt ?? item.title ?? '',
          title: item.title,
          badge: item.badge,
          projectId: item.projectId || item['data-project']
        };
      }
    }
    const text = String(item).trim();
    return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };
  };

  const DEFAULT_ITEMS = [
    // ROW 0: Research & Infrastructure (5 unique projects)
    { image: 'images/fusionrush.jpg', title: 'Fusion Rush', badge: "ICETT '26", projectId: 'p1' },
    { image: 'images/visualai.jpg', title: 'Visual AI Proof Parser', badge: "PCSC '26", projectId: 'p2' },
    { image: 'images/takeit.png', title: 'TakeIt QR Tickets', badge: 'Crypto Tickets', projectId: 'p3' },
    { image: 'images/cropconnect.png', title: 'CropConnect', badge: 'AgriTech PWA', projectId: 'p5' },
    { image: 'images/dxform-logo.webp', title: 'DXForm PH Cloud', badge: 'Enterprise SaaS', projectId: 'p14' },

    // ROW 1: Priority Featured Projects in the Middle (5 unique projects)
    { image: 'images/resutex.png', title: 'ResuTex', badge: 'LaTeX ATS Studio', projectId: 'p13' },
    { image: 'images/gigipos.png', title: 'GigiPOS Platform', badge: 'Modern Retail POS', projectId: 'p10' },
    { image: 'images/refertoire.png', title: 'Refertoire PWA', badge: '100% Offline PWA', projectId: 'p9' },
    { image: 'images/aicquire.png', title: 'aicquire', badge: 'AI Hiring ATS', projectId: 'p12' },
    { image: 'images/dishcover.png', title: 'DishCover', badge: 'Smart Pantry AI', projectId: 'p4' },

    // ROW 2: Interactive Systems & Consumer Apps (5 unique projects)
    { image: 'images/whatswap.png', title: 'WhatSwap?!', badge: 'P2P Barter & Bids', projectId: 'p11' },
    { image: 'images/nexchef.png', title: 'Nexchef Kitchen', badge: 'Mobile Culinary', projectId: 'p8' },
    { image: 'images/bomberman.png', title: 'Bomberman Java', badge: 'Game Systems', projectId: 'p6' },
    { image: 'images/etanom.jpg', title: 'E-Tanom Logistics', badge: 'Supply Chain PWA', projectId: 'p7' },
    { image: 'images/band.png', title: 'Ensemble Stage Sync', badge: 'Live Audio Metric', projectId: 'p15' }
  ];

  class GridMotionInstance {
    constructor(element, options = {}) {
      this.container = element;
      this.container._gridMotionInstance = this;

      const ds = element.dataset || {};

      this.options = {
        rows: clamp(Math.round(options.rows ?? (ds.rows ? parseInt(ds.rows, 10) : 4)), 1, 12),
        aspectRatio: clamp(parseFloat(options.aspectRatio ?? ds.aspectRatio ?? 1.33), 0.3, 4),
        gap: Math.max(0, parseFloat(options.gap ?? ds.gap ?? 16)),
        radius: Math.max(0, parseFloat(options.radius ?? ds.radius ?? 14)),
        angle: parseFloat(options.angle ?? ds.angle ?? -12),
        tilt: clamp(parseFloat(options.tilt ?? ds.tilt ?? 0), 0, 75),
        speed: parseFloat(options.speed ?? ds.speed ?? 24),
        direction: DIRECTIONS.includes(options.direction || ds.direction) ? (options.direction || ds.direction) : 'alternate',
        parallax: clamp(parseFloat(options.parallax ?? ds.parallax ?? 0.5), 0, 1),
        spotlight: clamp(parseFloat(options.spotlight ?? ds.spotlight ?? 0.6), 0, 1),
        dim: clamp(parseFloat(options.dim ?? ds.dim ?? 0.35), 0, 1),
        grayscale: options.grayscale ?? (ds.grayscale === 'true'),
        fade: clamp(parseFloat(options.fade ?? ds.fade ?? 0.5), 0, 1),
        fadeBottom: options.fadeBottom ?? (ds.fadeBottom ? ds.fadeBottom === 'true' : false),
        tileColor: options.tileColor || ds.tileColor || null,
        textColor: options.textColor || ds.textColor || null,
        theme: options.theme || ds.theme || 'dark'
      };

      // Load items
      const scriptData = element.querySelector('script[type="application/json"]');
      if (scriptData) {
        try {
          this.items = JSON.parse(scriptData.textContent);
        } catch (e) {
          this.items = options.items || DEFAULT_ITEMS;
        }
      } else {
        this.items = options.items || DEFAULT_ITEMS;
      }

      // Check if items are partitioned by row: { row0, row1, row2 } or [ [...], [...], [...] ]
      if (Array.isArray(this.items) && this.items.length > 0 && Array.isArray(this.items[0])) {
        this.rowTilePools = this.items.map(rowList => rowList.map(toTile));
        this.tiles = this.rowTilePools.flat();
      } else if (this.items && typeof this.items === 'object' && !Array.isArray(this.items) && this.items.row0) {
        this.rowTilePools = [
          (this.items.row0 || []).map(toTile),
          (this.items.row1 || []).map(toTile),
          (this.items.row2 || []).map(toTile)
        ];
        this.tiles = this.rowTilePools.flat();
      } else {
        // Flat array: partition evenly among rows so NO row shares any item with another row
        const flat = (Array.isArray(this.items) && this.items.length ? this.items : DEFAULT_ITEMS).map(toTile);
        this.tiles = flat;
        const numRows = Math.max(1, this.options.rows || 3);
        const perRow = Math.ceil(flat.length / numRows);
        this.rowTilePools = [];
        for (let r = 0; r < numRows; r++) {
          const slice = flat.slice(r * perRow, (r + 1) * perRow);
          this.rowTilePools.push(slice.length > 0 ? slice : flat);
        }
      }

      this.motion = {
        offsets: [],
        shifts: [],
        intro: 0,
        pointer: { x: 0, y: 0, active: false }
      };

      this.layout = null;
      this.plane = null;
      this.rowEls = [];
      this.tileEls = [];
      this.spots = [];
      this.written = [];

      this.raf = 0;
      this.last = 0;
      this.visible = true;
      this.alive = true;

      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onPointerLeave = this.onPointerLeave.bind(this);
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);

      this.init();
    }

    init() {
      const root = this.container;
      const s = this.options;
      const palette = THEMES[s.theme] ?? THEMES.dark;

      root.classList.add('grid-motion');
      if (s.grayscale) root.classList.add('grid-motion--gray');

      root.style.setProperty('--gm-tile', s.tileColor || palette.tile);
      root.style.setProperty('--gm-text', s.textColor || palette.text);
      root.style.setProperty('--gm-border', palette.border);
      root.style.setProperty('--gm-radius', `${s.radius}px`);
      root.style.setProperty('--gm-dim', s.dim);

      if (s.fade > 0) {
        const vMask = s.fadeBottom ? feather('to bottom', s.fade * 44) : featherTop(s.fade * 44);
        const mask = `${feather('to right', s.fade * 34)}, ${vMask}`;
        root.style.maskImage = mask;
        root.style.webkitMaskImage = mask;
        root.style.maskComposite = 'intersect';
        root.style.webkitMaskComposite = 'source-in';
      }

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerdown', this.onPointerMove, { passive: true });
      window.addEventListener('pointerup', this.onPointerUp);
      window.addEventListener('blur', this.onPointerLeave);
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(root);

      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        if (this.visible && !this.raf) {
          this.last = performance.now();
          this.raf = requestAnimationFrame(this.frame);
        }
      });
      this.intersectionObserver.observe(root);

      window.addEventListener('resize', this.resize, { passive: true });
      window.addEventListener('load', this.resize, { passive: true });

      this.resize();
      setTimeout(this.resize, 60);
      setTimeout(this.resize, 250);
    }

    computeLayout(width, height) {
      if (!width || !height) return null;
      const s = this.options;
      const turn = (s.angle * Math.PI) / 180;
      const lean = (s.tilt * Math.PI) / 180;
      const cos = Math.abs(Math.cos(turn));
      const sin = Math.abs(Math.sin(turn));
      const planeHeight = ((width * sin + height * cos) / Math.max(0.3, Math.cos(lean))) * 1.12;
      const planeWidth = (width * cos + height * sin) * (1 + Math.sin(lean) * 0.9) * 1.12;
      const tileHeight = Math.max(16, (planeHeight - s.gap * (s.rows - 1)) / s.rows);
      const tileWidth = tileHeight * s.aspectRatio;
      const step = tileWidth + s.gap;

      // Calculate row-specific periods and copies so each row loops only its dedicated unique projects
      const rowLayouts = [];
      for (let r = 0; r < s.rows; r++) {
        const pool = (this.rowTilePools && this.rowTilePools[r]) ? this.rowTilePools[r] : this.tiles;
        const N = Math.max(1, pool.length);
        const rowPeriod = N * step;
        const copies = Math.ceil(planeWidth / rowPeriod) + 3;
        const totalTiles = copies * N;
        rowLayouts.push({
          N,
          rowPeriod,
          copies,
          totalTiles
        });
      }

      return {
        planeWidth,
        planeHeight,
        tileWidth,
        tileHeight,
        step,
        rowLayouts,
        top: (planeHeight - s.rows * tileHeight - (s.rows - 1) * s.gap) / 2,
        perspective: Math.max(width, height) * 1.5
      };
    }

    buildDOM() {
      const root = this.container;
      const layout = this.layout;
      const s = this.options;
      if (!layout) return;

      root.innerHTML = '';

      if (s.tilt > 0) {
        root.style.perspective = `${layout.perspective}px`;
      }

      const plane = document.createElement('div');
      plane.className = 'grid-motion__plane';
      plane.setAttribute('aria-hidden', 'true');
      plane.style.width = `${layout.planeWidth}px`;
      plane.style.height = `${layout.planeHeight}px`;
      plane.style.transform = `translate(-50%, -50%) rotateX(${s.tilt}deg) rotateZ(${s.angle}deg)`;
      plane.style.setProperty('--gm-gap', `${s.gap}px`);
      plane.style.setProperty('--gm-tile-w', `${layout.tileWidth}px`);
      plane.style.setProperty('--gm-tile-h', `${layout.tileHeight}px`);
      plane.style.setProperty('--gm-font', `${clamp(layout.tileHeight * 0.12, 12, 32)}px`);

      this.plane = plane;
      this.rowEls = [];
      this.tileEls = [];
      this.spots = [];
      this.written = [];

      for (let r = 0; r < s.rows; r++) {
        const row = document.createElement('div');
        row.className = 'grid-motion__row';
        row.style.top = `${layout.top + r * (layout.tileHeight + s.gap)}px`;

        const pool = (this.rowTilePools && this.rowTilePools[r]) ? this.rowTilePools[r] : this.tiles;
        const rowInfo = (layout.rowLayouts && layout.rowLayouts[r]) ? layout.rowLayouts[r] : { N: pool.length, totalTiles: pool.length * 4 };
        const N = rowInfo.N;
        const totalTiles = rowInfo.totalTiles;

        const rowTileList = [];
        for (let k = 0; k < totalTiles; k++) {
          const tileData = pool[k % N];
          const tile = document.createElement('div');
          tile.className = `grid-motion__tile${tileData.projectId ? ' open-modal-btn' : ''}`;
          if (tileData.projectId) {
            tile.setAttribute('tabindex', '0');
            tile.setAttribute('role', 'button');
            tile.setAttribute('aria-label', `View ${tileData.title || 'Project'}`);
            tile.dataset.project = tileData.projectId;
            tile.dataset.projectId = tileData.projectId;
          }

          if (tileData.kind === 'image') {
            const img = document.createElement('img');
            img.src = tileData.src;
            img.alt = tileData.alt || '';
            img.draggable = false;
            img.loading = 'lazy';
            img.decoding = 'async';
            tile.appendChild(img);

            if (tileData.badge || tileData.title) {
              const overlay = document.createElement('span');
              overlay.className = 'grid-motion__overlay';
              overlay.setAttribute('aria-hidden', 'true');
              tile.appendChild(overlay);

              if (tileData.badge) {
                const badge = document.createElement('span');
                badge.className = 'grid-motion__badge';
                badge.textContent = tileData.badge;
                tile.appendChild(badge);
              }

              if (tileData.title) {
                const caption = document.createElement('span');
                caption.className = 'grid-motion__caption';
                caption.textContent = tileData.title;
                tile.appendChild(caption);
              }
            }
          } else if (tileData.kind === 'text') {
            const textSpan = document.createElement('span');
            textSpan.className = 'grid-motion__text';
            textSpan.textContent = tileData.text;
            tile.appendChild(textSpan);
          }

          row.appendChild(tile);
          rowTileList.push(tile);
        }

        plane.appendChild(row);
        this.rowEls.push(row);
        this.tileEls.push(rowTileList);
        this.spots.push(new Float32Array(rowTileList.length));
        this.written.push(new Float32Array(rowTileList.length));
      }

      root.appendChild(plane);
      plane.style.opacity = '1';
    }

    resize() {
      const root = this.container;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const parent = root.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : null;

      const rawWidth =
        rect.width ||
        root.clientWidth ||
        (parentRect ? parentRect.width : 0) ||
        (parent ? parent.clientWidth : 0) ||
        window.innerWidth;

      const rawHeight =
        rect.height ||
        root.clientHeight ||
        (parentRect ? parentRect.height : 0) ||
        (parent ? parent.clientHeight : 0) ||
        740;

      const width = Math.max(1, Math.round(rawWidth));
      const height = Math.max(1, Math.round(rawHeight));

      const newLayout = this.computeLayout(width, height);
      if (!newLayout) return;

      const prevLayout = this.layout;
      this.layout = newLayout;

      // Rebuild if layout dimensions meaningfully changed
      if (
        !prevLayout ||
        JSON.stringify(prevLayout.rowLayouts) !== JSON.stringify(newLayout.rowLayouts) ||
        Math.abs(prevLayout.planeWidth - newLayout.planeWidth) > 8 ||
        Math.abs(prevLayout.planeHeight - newLayout.planeHeight) > 8
      ) {
        this.buildDOM();
      }

      if (this.visible && !this.raf) {
        this.last = performance.now();
        this.raf = requestAnimationFrame(this.frame);
      }
    }

    onPointerMove(event) {
      this.motion.pointer.x = event.clientX;
      this.motion.pointer.y = event.clientY;
      this.motion.pointer.active = true;
    }

    onPointerUp(event) {
      if (event.pointerType === 'touch') {
        this.motion.pointer.active = false;
      }
    }

    onPointerLeave() {
      this.motion.pointer.active = false;
    }

    frame(now) {
      this.raf = 0;
      if (!this.alive) return;

      const root = this.container;
      const plane = this.plane;
      const layout = this.layout;
      const s = this.options;
      const motion = this.motion;

      if (!root || !plane || !layout) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
      this.last = now;

      if (motion.intro < 1) {
        motion.intro = Math.min(1, motion.intro + dt / 0.9);
        plane.style.opacity = String(1 - (1 - motion.intro) ** 3);
      }

      const rect = root.getBoundingClientRect();
      const scale = rect.width ? root.clientWidth / rect.width : 1;
      const halfWidth = root.clientWidth / 2 || 1;
      const halfHeight = root.clientHeight / 2 || 1;
      const px = (motion.pointer.x - rect.left) * scale - halfWidth;
      const py = (motion.pointer.y - rect.top) * scale - halfHeight;
      const inside = motion.pointer.active && Math.abs(px) <= halfWidth && Math.abs(py) <= halfHeight;
      const lean = (s.tilt * Math.PI) / 180;
      const turn = (s.angle * Math.PI) / 180;
      const depth = layout.perspective;

      let flatY = py;
      let flatX = px;
      if (lean > 0.0001) {
        flatY = (py * depth) / (depth * Math.cos(lean) + py * Math.sin(lean));
        flatX = (px * (depth - flatY * Math.sin(lean))) / depth;
      }
      const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn);
      const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn);
      const nudge = motion.pointer.active ? clamp(px / halfWidth, -1, 1) : 0;
      const reach = (0.6 + 2.2 * s.spotlight) * Math.max(layout.tileWidth, layout.tileHeight);
      const settle = 1 - Math.exp(-dt / 0.22);
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

      this.rowEls.forEach((row, r) => {
        const drift = s.direction === 'left' ? -1 : s.direction === 'right' ? 1 : r % 2 ? 1 : -1;
        if (motion.offsets[r] === undefined) {
          motion.offsets[r] = 0;
          motion.shifts[r] = 0;
        }
        if (!reduce) {
          motion.offsets[r] += s.speed * drift * PACE[r % PACE.length] * dt;
        }
        const target = reduce ? 0 : s.parallax * layout.tileWidth * 1.2 * nudge * (r % 2 ? -1 : 1);
        motion.shifts[r] += (target - motion.shifts[r]) * (1 - Math.exp(-dt / INERTIA[r % INERTIA.length]));
        const rowInfo = (layout.rowLayouts && layout.rowLayouts[r]) ? layout.rowLayouts[r] : null;
        const rowPeriod = rowInfo ? rowInfo.rowPeriod : layout.planeWidth;
        const x = -rowPeriod + wrap(motion.offsets[r] + motion.shifts[r], rowPeriod);
        row.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;

        const rowY = layout.top + r * (layout.tileHeight + s.gap) + layout.tileHeight / 2 - layout.planeHeight / 2;
        const left = x - layout.planeWidth / 2 + layout.tileWidth / 2;
        const list = this.tileEls[r];
        const values = this.spots[r];
        const marks = this.written[r];

        if (list && values && marks) {
          for (let k = 0; k < list.length; k++) {
            let wanted = 0;
            if (inside && s.spotlight > 0) {
              const distance = Math.hypot(left + k * layout.step - planeX, rowY - planeY) / reach;
              wanted = 1 - smoothstep(0.25, 1, distance);
            }
            values[k] += (wanted - values[k]) * settle;
            if (Math.abs(values[k] - marks[k]) > 0.004 || (wanted === 0 && values[k] < 0.004 && marks[k] !== 0)) {
              marks[k] = values[k] < 0.004 ? 0 : values[k];
              list[k].style.setProperty('--spot', marks[k].toFixed(3));
            }
          }
        }
      });

      if (this.visible) {
        this.raf = requestAnimationFrame(this.frame);
      }
    }

    destroy() {
      this.alive = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      window.removeEventListener('resize', this.resize);
      window.removeEventListener('load', this.resize);
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerdown', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('blur', this.onPointerLeave);
      document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    }
  }

  function initGridMotion(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return null;
    return new GridMotionInstance(container, options);
  }

  function autoInit() {
    const elements = document.querySelectorAll('[data-grid-motion="true"], .grid-motion-container');
    elements.forEach((el) => {
      if (el._gridMotionInstance) return;
      el._gridMotionInstance = new GridMotionInstance(el);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  global.GridMotion = {
    init: initGridMotion,
    Instance: GridMotionInstance
  };
})(typeof window !== 'undefined' ? window : this);
