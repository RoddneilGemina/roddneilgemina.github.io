/**
 * React Bits - DotGrid Background (WebGL2 Interactive Physics Grid)
 * Vanilla JavaScript Implementation for High-Performance Standalone Websites
 * Adapted from React Bits (reactbits.dev) DotGrid component.
 */
(function(window, document) {
  'use strict';

  const VERTEX = "#version 300 es\nprecision highp float;\n\nlayout(location = 0) in vec2 aCorner;\nlayout(location = 1) in vec4 aMotion;\nlayout(location = 2) in vec2 aState;\n\nuniform vec2 uResolution;\nuniform float uSize;\nuniform float uSwell;\nuniform float uStretch;\nuniform float uGlow;\n\nout vec2 vLocal;\nout vec2 vPoint;\nout float vLength;\nout float vRadius;\nout float vEnergy;\n\nvoid main() {\n  float energy = aState.x;\n  float radius = 0.5 * uSize * aState.y * (1.0 + uSwell * energy);\n  float speed = length(aMotion.zw);\n  float angle = speed > 0.001 ? atan(aMotion.w, aMotion.z) : 0.0;\n  float axis = floor(angle / 1.5707963 + 0.5) * 1.5707963;\n  angle = axis + (angle - axis) * smoothstep(8.0, 70.0, speed);\n  vec2 dir = vec2(cos(angle), sin(angle));\n  float halfLength = min(uSize * 2.0, speed * uStretch * 0.02);\n  float pad = radius * (1.0 + uGlow * energy * 2.5) + 2.0;\n  vec2 local = aCorner * vec2(halfLength + pad, pad);\n  vec2 point = aMotion.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;\n  vLocal = local;\n  vPoint = point;\n  vLength = halfLength;\n  vRadius = radius;\n  vEnergy = energy;\n  vec2 clip = point / uResolution * 2.0 - 1.0;\n  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\n}\n";

  const FRAGMENT = "#version 300 es\nprecision highp float;\n\nin vec2 vLocal;\nin vec2 vPoint;\nin float vLength;\nin float vRadius;\nin float vEnergy;\n\nuniform vec2 uResolution;\nuniform vec3 uBase;\nuniform vec3 uActive;\nuniform float uGlow;\nuniform float uOpacity;\nuniform float uFade;\nuniform int uShape;\n\nout vec4 outColor;\n\nfloat smootherstep01(float t) {\n  t = clamp(t, 0.0, 1.0);\n  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n}\n\nvoid main() {\n  float d;\n  if (uShape == 1) {\n    float corner = vRadius * 0.3;\n    vec2 q = abs(vLocal) - vec2(vLength + vRadius, vRadius) + corner;\n    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;\n  } else {\n    d = length(vec2(max(abs(vLocal.x) - vLength, 0.0), vLocal.y)) - vRadius;\n  }\n  float aa = max(fwidth(d), 0.0001);\n  float body = clamp(0.5 - d / aa, 0.0, 1.0);\n  float halo = uGlow * vEnergy * 0.5 * exp(-max(d, 0.0) / max(vRadius * 1.3, 0.6));\n  float alpha = body + (1.0 - body) * halo;\n  vec3 color = mix(uBase, uActive, clamp(vEnergy * 1.2, 0.0, 1.0));\n  float fade = 1.0;\n  if (uFade > 0.0) {\n    vec2 edge = min(vPoint, uResolution - vPoint) / (uFade * 0.4 * min(uResolution.x, uResolution.y));\n    fade = smootherstep01(edge.x) * smootherstep01(edge.y);\n  }\n  alpha *= uOpacity * fade;\n  outColor = vec4(color * alpha, alpha);\n}\n";

  const toRgb = color => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
    if (!match) return [1, 1, 1];
    const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
    return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  };

  const smootherstep = t => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  const backOut = t => {
    const s = 1.9;
    const x = t - 1;
    return 1 + x * x * ((s + 1) * x + s);
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[DotGrid] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  class DotGrid {
    constructor(container, options = {}) {
      if (!container) return;
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      const ds = this.container.dataset || {};

      this.settings = {
        dotSize: ds.dotSize !== undefined ? parseFloat(ds.dotSize) : (options.dotSize ?? 5),
        gap: ds.gap !== undefined ? parseFloat(ds.gap) : (options.gap ?? 18),
        baseColor: ds.baseColor || options.baseColor || '#3a3446',
        activeColor: ds.activeColor || options.activeColor || '#ffffff',
        proximity: ds.proximity !== undefined ? parseFloat(ds.proximity) : (options.proximity ?? 140),
        strength: ds.strength !== undefined ? parseFloat(ds.strength) : (options.strength ?? 1),
        bounce: ds.bounce !== undefined ? parseFloat(ds.bounce) : (options.bounce ?? 0.6),
        tension: ds.tension !== undefined ? parseFloat(ds.tension) : (options.tension ?? 0.4),
        returnDuration: ds.returnDuration !== undefined ? parseFloat(ds.returnDuration) : (options.returnDuration ?? 0.8),
        shockRadius: ds.shockRadius !== undefined ? parseFloat(ds.shockRadius) : (options.shockRadius ?? 320),
        shockStrength: ds.shockStrength !== undefined ? parseFloat(ds.shockStrength) : (options.shockStrength ?? 5),
        swell: ds.swell !== undefined ? parseFloat(ds.swell) : (options.swell ?? 0.8),
        stretch: ds.stretch !== undefined ? parseFloat(ds.stretch) : (options.stretch ?? 0.5),
        glow: ds.glow !== undefined ? parseFloat(ds.glow) : (options.glow ?? 0.5),
        shape: ds.shape || options.shape || 'circle',
        fade: ds.fade !== undefined ? parseFloat(ds.fade) : (options.fade ?? 0),
        opacity: ds.opacity !== undefined ? parseFloat(ds.opacity) : (options.opacity ?? 1),
        intro: ds.intro !== 'false' && options.intro !== false,
        mouseInteraction: ds.mouseInteraction !== 'false' && options.mouseInteraction !== false,
        clickShock: ds.clickShock === 'true' || options.clickShock === true,
        paused: ds.paused === 'true' || options.paused === true,
        dpr: ds.dpr !== undefined ? parseFloat(ds.dpr) : (options.dpr ?? null)
      };

      this.init();
    }

    init() {
      let canvas = this.container.querySelector('canvas.dot-grid__canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'dot-grid__canvas';
        canvas.setAttribute('aria-hidden', 'true');
        this.container.appendChild(canvas);
      }
      this.canvas = canvas;

      const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
      });
      if (!gl) {
        console.warn('[DotGrid] WebGL2 not supported.');
        return;
      }
      this.gl = gl;

      const vertShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
      const fragShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      if (!vertShader || !fragShader) return;

      const program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('[DotGrid] Program link error:', gl.getProgramInfoLog(program));
        return;
      }
      this.program = program;

      const uniforms = {};
      for (const name of [
        'uResolution',
        'uSize',
        'uBase',
        'uActive',
        'uGlow',
        'uOpacity',
        'uFade',
        'uShape',
        'uSwell',
        'uStretch'
      ]) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      this.uniforms = uniforms;

      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const cornerBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const instanceBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0);
      gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);
      gl.vertexAttribDivisor(2, 1);

      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const view = { width: 1, height: 1, left: 0, top: 0, ratio: 1 };
      const grid = { count: 0, cols: 0, rows: 0, cell: 1, centerX: 0, centerY: 0, reach: 1 };
      const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, lastTime: 0, inside: false };
      const shocks = [];

      let rest = new Float32Array(0);
      let offset = new Float32Array(0);
      let velocity = new Float32Array(0);
      let force = new Float32Array(0);
      let next = new Float32Array(0);
      let wave = new Float32Array(0);
      let energy = new Float32Array(0);
      let instances = new Float32Array(0);
      let introStart = performance.now();
      let lastTime = performance.now();
      let raf = 0;
      let visible = true;

      const rebuild = () => {
        const s = this.settings;
        const size = s.dotSize;
        const spacing = s.gap;
        const cell = Math.max(2, size + spacing);
        const cols = Math.max(1, Math.floor((view.width + spacing) / cell));
        const rows = Math.max(1, Math.floor((view.height + spacing) / cell));
        const startX = (view.width - (cols * cell - spacing)) / 2 + size / 2;
        const startY = (view.height - (rows * cell - spacing)) / 2 + size / 2;
        const count = cols * rows;
        rest = new Float32Array(count * 2);
        offset = new Float32Array(count * 2);
        velocity = new Float32Array(count * 2);
        force = new Float32Array(count * 2);
        next = new Float32Array(count * 2);
        wave = new Float32Array(count * 4);
        energy = new Float32Array(count);
        instances = new Float32Array(count * 6);
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const index = (row * cols + col) * 2;
            rest[index] = startX + col * cell;
            rest[index + 1] = startY + row * cell;
          }
        }
        Object.assign(grid, {
          count,
          cols,
          rows,
          cell,
          centerX: view.width / 2,
          centerY: view.height / 2,
          reach: Math.hypot(view.width, view.height) / 2
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, instances.byteLength, gl.DYNAMIC_DRAW);
      };

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const maxDim = 4096;
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        const autoMaxRatio = (width * 2 > maxDim || height * 2 > maxDim) ? 1 : 2;
        const ratio = Math.min(this.settings.dpr ?? window.devicePixelRatio ?? 1, autoMaxRatio);
        Object.assign(view, { width, height, left: rect.left, top: rect.top, ratio });
        const pixelWidth = Math.min(maxDim, Math.round(width * ratio));
        const pixelHeight = Math.min(maxDim, Math.round(height * ratio));
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
        }
        rebuild();
        render(performance.now());
      };

      const step = (dt, now) => {
        const s = this.settings;
        const motion = reduced ? 0 : 1;
        const zeta = 1 - 0.85 * Math.min(1, Math.max(0, s.bounce));
        const omega = 4 / (zeta * Math.max(0.2, s.returnDuration));
        const stiffness = omega * omega;
        const damping = 2 * zeta * omega;
        const radius = Math.max(1, s.proximity);
        const speed = Math.hypot(pointer.vx, pointer.vy);
        const drive = s.mouseInteraction && pointer.inside ? 6500 * Math.tanh(speed / 900) * s.strength * motion : 0;
        const dirX = speed > 0.001 ? pointer.vx / speed : 0;
        const dirY = speed > 0.001 ? pointer.vy / speed : 0;
        const width = grid.cell * 1.4;
        const travel = 650;
        const active = shocks.map(shock => {
          const front = ((now - shock.start) / 1000) * travel;
          const power = smootherstep(1 - front / Math.max(1, s.shockRadius));
          return { ...shock, front, amplitude: power * s.shockStrength * grid.cell * 0.24 * motion };
        });
        const coupling = (Math.max(0, s.tension) * 70) / (grid.cell * grid.cell);

        for (let row = 0; row < grid.rows; row++) {
          for (let col = 0; col < grid.cols; col++) {
            const i = row * grid.cols + col;
            const p = i * 2;
            let fx = -stiffness * offset[p] - damping * velocity[p];
            let fy = -stiffness * offset[p + 1] - damping * velocity[p + 1];

            if (coupling > 0) {
              const ox = offset[p];
              const oy = offset[p + 1];
              if (col > 0) {
                fx += (offset[p - 2] - ox) * coupling;
                fy += (offset[p - 1] - oy) * coupling;
              }
              if (col < grid.cols - 1) {
                fx += (offset[p + 2] - ox) * coupling;
                fy += (offset[p + 3] - oy) * coupling;
              }
              if (row > 0) {
                fx += (offset[p - grid.cols * 2] - ox) * coupling;
                fy += (offset[p - grid.cols * 2 + 1] - oy) * coupling;
              }
              if (row < grid.rows - 1) {
                fx += (offset[p + grid.cols * 2] - ox) * coupling;
                fy += (offset[p + grid.cols * 2 + 1] - oy) * coupling;
              }
            }

            if (drive > 0) {
              const dx = rest[p] + offset[p] - pointer.x;
              const dy = rest[p + 1] + offset[p + 1] - pointer.y;
              const d = Math.hypot(dx, dy);
              if (d < radius) {
                const f = (1 - smootherstep(d / radius)) * drive;
                fx += dirX * f;
                fy += dirY * f;
              }
            }

            for (const shock of active) {
              if (shock.amplitude <= 0.001) continue;
              const dx = rest[p] + offset[p] - shock.x;
              const dy = rest[p + 1] + offset[p + 1] - shock.y;
              const d = Math.hypot(dx, dy);
              const diff = d - shock.front;
              if (Math.abs(diff) < width) {
                const sVal = shock.amplitude * (1 - smootherstep(Math.abs(diff) / width));
                const inv = d > 0.001 ? 1 / d : 0;
                fx += dx * inv * sVal * 40;
                fy += dy * inv * sVal * 40;
              }
            }

            force[p] = fx;
            force[p + 1] = fy;
          }
        }

        let maxSpeed = 0;
        let maxOffset = 0;
        for (let i = 0; i < grid.count; i++) {
          const p = i * 2;
          velocity[p] += force[p] * dt;
          velocity[p + 1] += force[p + 1] * dt;
          offset[p] += velocity[p] * dt;
          offset[p + 1] += velocity[p + 1] * dt;
          const spd = Math.hypot(velocity[p], velocity[p + 1]);
          const off = Math.hypot(offset[p], offset[p + 1]);
          if (spd > maxSpeed) maxSpeed = spd;
          if (off > maxOffset) maxOffset = off;
          next[p] = rest[p] + offset[p];
          next[p + 1] = rest[p + 1] + offset[p + 1];
        }

        const decay = Math.exp(-dt * 4.5);
        for (let i = 0; i < grid.count; i++) {
          const p = i * 2;
          const motionVal = Math.hypot(offset[p], offset[p + 1]) / (grid.cell * 0.45);
          energy[i] = Math.max(motionVal, energy[i] * decay);
        }

        for (let i = shocks.length - 1; i >= 0; i--) {
          if ((now - shocks[i].start) / 1000 > s.shockRadius / travel) shocks.splice(i, 1);
        }

        return maxSpeed > 0.5 || maxOffset > 0.5 || shocks.length > 0;
      };

      const render = now => {
        const s = this.settings;
        const progress = s.intro ? Math.min(1, (now - introStart) / 1200) : 1;
        const scaleVal = s.intro ? backOut(progress) : 1;

        for (let i = 0; i < grid.count; i++) {
          const p = i * 2;
          const inst = i * 6;
          let delay = 0;
          if (s.intro && progress < 1) {
            const d = Math.hypot(rest[p] - grid.centerX, rest[p + 1] - grid.centerY);
            delay = (d / grid.reach) * 0.45;
          }
          const itemProgress = s.intro ? Math.min(1, Math.max(0, (progress - delay) / (1 - delay || 1))) : 1;
          const itemScale = s.intro ? backOut(itemProgress) : 1;

          instances[inst] = next[p] * view.ratio;
          instances[inst + 1] = next[p + 1] * view.ratio;
          instances[inst + 2] = velocity[p] * view.ratio;
          instances[inst + 3] = velocity[p + 1] * view.ratio;
          instances[inst + 4] = energy[i];
          instances[inst + 5] = itemScale;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.uSize, s.dotSize * view.ratio);
        gl.uniform3fv(uniforms.uBase, toRgb(s.baseColor));
        gl.uniform3fv(uniforms.uActive, toRgb(s.activeColor));
        gl.uniform1f(uniforms.uGlow, s.glow);
        gl.uniform1f(uniforms.uOpacity, s.opacity);
        gl.uniform1f(uniforms.uFade, s.fade);
        gl.uniform1i(uniforms.uShape, s.shape === 'square' ? 1 : 0);
        gl.uniform1f(uniforms.uSwell, s.swell);
        gl.uniform1f(uniforms.uStretch, s.stretch);

        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances);

        gl.bindVertexArray(vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, grid.count);
      };

      const loop = now => {
        raf = 0;
        if (!visible) return;
        const dt = Math.min(0.033, (now - lastTime) / 1000);
        lastTime = now;
        const animating = step(dt, now);
        render(now);
        if (animating || (this.settings.intro && now - introStart < 1400) || pointer.inside) {
          raf = requestAnimationFrame(loop);
        }
      };

      const wake = () => {
        if (!raf && visible && !this.settings.paused) {
          lastTime = performance.now();
          raf = requestAnimationFrame(loop);
        }
      };

      const onMove = e => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const now = performance.now();
        const dt = Math.max(0.001, (now - pointer.lastTime) / 1000);
        pointer.vx = (x - pointer.x) / dt;
        pointer.vy = (y - pointer.y) / dt;
        pointer.x = x;
        pointer.y = y;
        pointer.lastTime = now;
        pointer.inside = x >= 0 && y >= 0 && x <= view.width && y <= view.height;
        wake();
      };

      const onOut = e => {
        if (!e.relatedTarget) {
          pointer.inside = false;
        }
      };

      const onLeave = () => {
        pointer.inside = false;
      };

      const onDown = e => {
        if (!this.settings.clickShock) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > view.width || y > view.height) return;
        shocks.push({ x, y, start: performance.now() });
        if (shocks.length > 6) shocks.shift();
        wake();
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerout', onOut);
      window.addEventListener('blur', onLeave);

      const resizeObserver = new ResizeObserver(() => {
        resize();
        wake();
      });
      resizeObserver.observe(canvas);

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
      });
      visibilityObserver.observe(canvas);

      const onVisibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else {
          wake();
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      resize();
      wake();

      this.destroy = () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerout', onOut);
        window.removeEventListener('blur', onLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        gl.deleteBuffer(cornerBuffer);
        gl.deleteBuffer(instanceBuffer);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
      };
    }
  }

  function initAllDotGrids() {
    const targets = document.querySelectorAll('[data-dot-grid="true"], .dot-grid');
    targets.forEach(el => {
      if (!el._dotGridInstance) {
        el._dotGridInstance = new DotGrid(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllDotGrids);
  } else {
    initAllDotGrids();
  }

  window.DotGrid = DotGrid;
})(window, document);
