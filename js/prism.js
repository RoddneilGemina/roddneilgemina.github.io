/**
 * Prism Component (Vanilla JavaScript + WebGL 2 Raymarching Implementation)
 * Based on React Bits <Prism /> component.
 * Features:
 * - GLSL 3.0 ES raymarched pyramid prism with internal spectral dispersion
 * - Dynamic Euler rotation matrix animation ('rotate', '3drotate', 'hover', 'static')
 * - Physics-based cursor inertia and reach tilt
 * - High-efficiency single-triangle screen coverage
 * - IntersectionObserver to pause rendering when offscreen (zero battery/GPU waste)
 * - Device pixel ratio and resolution scaling
 * - Full theme compatibility (dark & light ink modes)
 */

(function (global) {
  'use strict';

  const INTRO_SECONDS = 1.4;
  const PALETTE_SIZE = 64;
  const HUE_W = [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114];
  const HUE_U = [0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.3, -0.588, 0.886];
  const HUE_V = [0.168, -0.331, 0.5, 0.328, 0.035, -0.5, -0.497, 0.296, 0.201];

  const VERTEX = `#version 300 es
  in vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

  const FRAGMENT = `#version 300 es
  precision highp float;
  uniform vec2 uResolution;
  uniform mat3 uRay;
  uniform float uGlow;
  uniform vec2 uOffset;
  uniform float uColorFreq;
  uniform float uCenterShift;
  uniform float uInvBaseHalf;
  uniform float uInvHeight;
  uniform float uMinAxis;
  uniform float uPxScale;
  uniform sampler2D uPalette;
  uniform int uUsePalette;
  uniform float uTime;
  uniform float uNoise;
  uniform float uSaturation;
  uniform mat3 uHue;
  uniform int uUseHue;
  uniform float uLight;
  uniform float uNeutral;
  out vec4 outColor;

  const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);
  const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float pyramid(vec3 p) {
    vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
    return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);
  }

  vec3 grade(vec3 col, vec2 seed) {
    col += (rand(seed) - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
    float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);
    if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);
    return col;
  }

  void main() {
    vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;
    vec3 origin = uRay * vec3(f, 0.0);
    vec3 axis = uRay[2];
    float z = 5.0;
    vec4 o = vec4(0.0);
    for (int i = 0; i < 100; i++) {
      vec3 p = origin + axis * z;
      float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));
      z -= d;
      float phase = (p.y + z) * uColorFreq;
      vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;
      if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;
      o += band / d;
    }
    vec4 raw = o * o * uGlow / 1e5;
    vec4 e = exp(2.0 * raw);
    vec4 mapped = (e - 1.0) / (e + 1.0);
    vec2 seed = gl_FragCoord.xy + vec2(uTime);
    if (uLight > 0.5) {
      float peak = max(raw.r, max(raw.g, raw.b));
      vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);
      vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);
      float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;
      float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);
      outColor = vec4(ink * cover, cover);
    } else {
      outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);
    }
  }`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  };

  const link = (gl) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    const posAttrib = gl.getAttribLocation(program, 'aPosition');
    return { program, uniforms, posAttrib };
  };

  const rotation = (yaw, pitch, roll) => {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cx = Math.cos(pitch);
    const sx = Math.sin(pitch);
    const cz = Math.cos(roll);
    const sz = Math.sin(roll);
    return [
      cy * cz + sy * sx * sz,
      cx * sz,
      -sy * cz + cy * sx * sz,
      -cy * sz + sy * sx * cz,
      cx * cz,
      sy * sz + cy * sx * cz,
      sy * cx,
      -sx,
      cy * cx
    ];
  };

  const multiply = (a, b) => {
    const out = new Array(9);
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 3; r++) {
        out[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
      }
    }
    return out;
  };

  class PrismInstance {
    constructor(container, options = {}) {
      this.container = container;
      this.options = Object.assign(
        {
          height: 3.5,
          baseWidth: 5.5,
          animationType: 'rotate', // 'rotate' | '3drotate' | 'hover' | 'static'
          glow: 1,
          offsetX: 0,
          offsetY: 0,
          noise: 0,
          scale: 3.6,
          hueShift: 0,
          colorFrequency: 1,
          colors: [],
          saturation: 1.5,
          timeScale: 0.5,
          interactive: true,
          hoverStrength: 2,
          inertia: 0.05,
          intro: true,
          resolution: 0.5,
          lightMode: false,
          dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
        },
        options
      );

      this.canvas = null;
      this.gl = null;
      this.shader = null;
      this.vao = null;
      this.buffer = null;
      this.paletteTexture = null;
      this.probe = null;

      this.paletteKey = '';
      this.neutral = 0;

      this.view = { width: 1, height: 1, scale: 1 };
      this.pose = { yaw: 0, pitch: 0, roll: 0 };
      this.pointer = { x: 0, y: 0, inside: false };
      this.time = 0;
      this.introClock = 0;
      this.raf = 0;
      this.last = 0;
      this.visible = true;
      this.reduceMotion = false;

      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerLeave = this.onPointerLeave.bind(this);
      this.onVisibility = this.onVisibility.bind(this);
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);
      this.wake = this.wake.bind(this);

      this.init();
    }

    init() {
      if (!this.container) return;

      // Match media reduced motion
      if (typeof window !== 'undefined' && window.matchMedia) {
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
      this.introClock = this.options.intro && !this.reduceMotion ? 0 : 1;

      // Create or reuse canvas
      let canvas = this.container.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.pointerEvents = 'none';
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
        console.warn('Prism: WebGL2 is not supported by your browser.');
        return;
      }
      this.gl = gl;

      const shader = link(gl);
      if (!shader) {
        console.warn('Prism: Shader program failed to compile or link.');
        return;
      }
      this.shader = shader;

      // Fullscreen Triangle buffer & VAO
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      if (shader.posAttrib >= 0) {
        gl.enableVertexAttribArray(shader.posAttrib);
        gl.vertexAttribPointer(shader.posAttrib, 2, gl.FLOAT, false, 0, 0);
      }

      // Palette Texture
      this.paletteTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Probe canvas for CSS color parsing
      const probeCanvas = document.createElement('canvas');
      probeCanvas.width = 1;
      probeCanvas.height = 1;
      this.probe = probeCanvas.getContext('2d', { willReadFrequently: true });

      // Observers & Listeners
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);

      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        if (this.visible) {
          this.last = 0;
          this.wake();
        }
      });
      this.intersectionObserver.observe(this.container);

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('blur', this.onPointerLeave);
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.onVisibility);

      this.resize();
      this.wake();
    }

    parseColor(value) {
      if (!this.probe) return [255, 255, 255];
      this.probe.clearRect(0, 0, 1, 1);
      this.probe.fillStyle = '#000000';
      this.probe.fillStyle = String(value);
      this.probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = this.probe.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    }

    syncPalette(colorsList) {
      if (!this.gl || !this.paletteTexture) return;
      const palette = Array.isArray(colorsList) ? colorsList.filter(Boolean).slice(0, 8) : [];
      const key = palette.join(',');
      if (key === this.paletteKey) return;
      this.paletteKey = key;
      this.neutral = 0;
      if (!palette.length) return;

      const stops = palette.map((c) => this.parseColor(c));
      this.neutral =
        1 -
        stops.reduce((sum, [r, g, b]) => {
          const top = Math.max(r, g, b);
          return sum + (top > 0 ? (top - Math.min(r, g, b)) / top : 0);
        }, 0) /
          stops.length;

      const data = new Uint8Array(PALETTE_SIZE * 4);
      for (let i = 0; i < PALETTE_SIZE; i++) {
        const position = (i / PALETTE_SIZE) * stops.length;
        const index = Math.floor(position);
        const a = stops[index % stops.length];
        const b = stops[(index + 1) % stops.length];
        const t = position - index;
        const k = t * t * (3 - 2 * t);
        for (let c = 0; c < 3; c++) {
          data[i * 4 + c] = Math.round(a[c] + (b[c] - a[c]) * k);
        }
        data[i * 4 + 3] = 255;
      }
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.paletteTexture);
      this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, PALETTE_SIZE, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    }

    orientation(s) {
      const tilt = rotation(this.pose.yaw, this.pose.pitch, this.pose.roll);
      const anim = s.animationType === 'rotate3d' ? '3drotate' : s.animationType;
      if (anim === 'rotate') {
        const t = this.time * s.timeScale;
        const c0 = Math.cos(t);
        const c1 = Math.cos(t + 33);
        const c2 = Math.cos(t + 11);
        return multiply(tilt, [c0, 0, c2, 0, 1, 0, c1, 0, c0]);
      }
      if (anim === '3drotate') {
        const t = this.time * s.timeScale;
        return multiply(tilt, rotation(t * 0.55, Math.sin(t * 0.6 + 0.6) * 0.6, Math.sin(t * 0.35 + 1.9) * 0.5));
      }
      return tilt;
    }

    draw() {
      const gl = this.gl;
      if (!gl || !this.shader) return;

      const s = this.options;
      const u = this.shader.uniforms;
      this.syncPalette(s.colors);

      const half = Math.max(0.1, s.baseWidth) * 0.5;
      const height = Math.max(0.1, s.height);
      const ignite = this.introClock * this.introClock * (3 - 2 * this.introClock);
      const hueRad = ((s.hueShift || 0) * Math.PI) / 180;
      const c = Math.cos(hueRad);
      const sn = Math.sin(hueRad);

      gl.bindVertexArray(this.vao);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.useProgram(this.shader.program);

      gl.uniform2f(u.uResolution, this.canvas.width, this.canvas.height);
      gl.uniformMatrix3fv(u.uRay, false, this.orientation(s));
      gl.uniform1f(u.uGlow, Math.max(0, s.glow) * ignite * ignite);
      gl.uniform2f(u.uOffset, (s.offsetX || 0) * this.view.scale, -(s.offsetY || 0) * this.view.scale);
      gl.uniform1f(u.uColorFreq, Math.max(0, s.colorFrequency));
      gl.uniform1f(u.uCenterShift, height * 0.25);
      gl.uniform1f(u.uInvBaseHalf, 1 / half);
      gl.uniform1f(u.uInvHeight, 1 / height);
      gl.uniform1f(u.uMinAxis, Math.min(half, height));
      gl.uniform1f(u.uPxScale, 1 / (this.canvas.height * 0.1 * Math.max(0.1, s.scale)));

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
      gl.uniform1i(u.uPalette, 0);
      gl.uniform1i(u.uUsePalette, s.colors && s.colors.length ? 1 : 0);

      gl.uniform1f(u.uTime, this.time);
      gl.uniform1f(u.uNoise, Math.max(0, s.noise));
      gl.uniform1f(u.uSaturation, Math.max(0, s.saturation));
      gl.uniformMatrix3fv(
        u.uHue,
        false,
        HUE_W.map((w, i) => w + HUE_U[i] * c + HUE_V[i] * sn)
      );
      gl.uniform1i(u.uUseHue, Math.abs(hueRad) > 0.0001 ? 1 : 0);
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);
      gl.uniform1f(u.uNeutral, this.neutral);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    resize() {
      if (!this.container || !this.canvas) return;
      const s = this.options;
      const dpr = Math.min(s.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1), 2);
      const resolution = clamp(s.resolution || 0.5, 0.25, 1);

      this.view.width = Math.max(1, this.container.clientWidth);
      this.view.height = Math.max(1, this.container.clientHeight);
      this.view.scale = dpr * resolution;

      const targetW = Math.max(1, Math.round(this.view.width * this.view.scale));
      const targetH = Math.max(1, Math.round(this.view.height * this.view.scale));

      if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
        this.canvas.width = targetW;
        this.canvas.height = targetH;
      }

      this.draw();
      this.wake();
    }

    frame(now) {
      this.raf = 0;
      if (!this.visible || (typeof document !== 'undefined' && document.hidden)) return;

      const s = this.options;
      const expectedW = Math.round(this.view.width * this.view.scale);
      if (expectedW !== this.canvas.width) {
        this.resize();
        return;
      }

      const dt = this.last ? clamp((now - this.last) / 1000, 0.001, 0.05) : 1 / 60;
      this.last = now;

      if (!this.reduceMotion) this.time += dt;
      if (this.introClock < 1) {
        this.introClock = Math.min(1, this.introClock + dt / INTRO_SECONDS);
      }

      const anim = s.animationType === 'rotate3d' ? '3drotate' : s.animationType;
      const hover = anim === 'hover';
      const aim = this.pointer.inside && !this.reduceMotion && (hover || s.interactive);
      const reach = (hover ? 0.6 : 0.09) * Math.max(0, s.hoverStrength);
      const yaw = aim ? -this.pointer.x * reach : 0;
      const pitch = aim ? this.pointer.y * reach : 0;
      const follow = 1 - Math.pow(1 - clamp(s.inertia, 0.001, 1), dt * 60);

      this.pose.yaw += (yaw - this.pose.yaw) * follow;
      this.pose.pitch += (pitch - this.pose.pitch) * follow;
      this.pose.roll += (0 - this.pose.roll) * (1 - Math.pow(0.9, dt * 60));

      this.draw();

      const settling = Math.abs(yaw - this.pose.yaw) + Math.abs(pitch - this.pose.pitch) + Math.abs(this.pose.roll) > 1e-4;
      const spinning = !this.reduceMotion && !hover && anim !== 'static' && s.timeScale > 0;
      const busy = spinning || settling || this.introClock < 1 || (!this.reduceMotion && s.noise > 0);

      if (busy) {
        this.raf = requestAnimationFrame(this.frame);
      } else {
        this.last = 0;
      }
    }

    wake() {
      if (!this.raf && this.visible && !(typeof document !== 'undefined' && document.hidden)) {
        this.raf = requestAnimationFrame(this.frame);
      }
    }

    onPointerMove(event) {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      this.pointer.inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;
      this.pointer.x = clamp(x, -1, 1);
      this.pointer.y = clamp(y, -1, 1);

      if (this.options.interactive || this.options.animationType === 'hover') {
        this.wake();
      }
    }

    onPointerLeave() {
      this.pointer.inside = false;
      this.wake();
    }

    onVisibility() {
      this.last = 0;
      this.wake();
    }

    setOptions(newOpts = {}) {
      Object.assign(this.options, newOpts);
      this.wake();
    }

    destroy() {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();

      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('blur', this.onPointerLeave);
      document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
      document.removeEventListener('visibilitychange', this.onVisibility);

      if (this.gl) {
        if (this.buffer) this.gl.deleteBuffer(this.buffer);
        if (this.paletteTexture) this.gl.deleteTexture(this.paletteTexture);
        if (this.vao) this.gl.deleteVertexArray(this.vao);
        if (this.shader?.program) this.gl.deleteProgram(this.shader.program);
        this.gl.getExtension('WEBGL_lose_context')?.loseContext();
      }

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  function initPrism(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return null;
    return new PrismInstance(container, options);
  }

  // Auto-init elements with [data-prism="true"]
  function autoInit() {
    const elements = document.querySelectorAll('[data-prism="true"]');
    elements.forEach((el) => {
      if (el._prismInstance) return;
      const opts = {};
      if (el.dataset.animationType) opts.animationType = el.dataset.animationType;
      if (el.dataset.timeScale) opts.timeScale = parseFloat(el.dataset.timeScale);
      if (el.dataset.height) opts.height = parseFloat(el.dataset.height);
      if (el.dataset.baseWidth) opts.baseWidth = parseFloat(el.dataset.baseWidth);
      if (el.dataset.scale) opts.scale = parseFloat(el.dataset.scale);
      if (el.dataset.hueShift) opts.hueShift = parseFloat(el.dataset.hueShift);
      if (el.dataset.colorFrequency) opts.colorFrequency = parseFloat(el.dataset.colorFrequency);
      if (el.dataset.glow) opts.glow = parseFloat(el.dataset.glow);
      if (el.dataset.interactive) opts.interactive = el.dataset.interactive === 'true';
      if (el.dataset.lightMode) opts.lightMode = el.dataset.lightMode === 'true';
      el._prismInstance = new PrismInstance(el, opts);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  global.Prism = {
    init: initPrism,
    Instance: PrismInstance
  };
})(typeof window !== 'undefined' ? window : this);
