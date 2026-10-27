/**
 * React Bits - Galaxy Background (WebGL2 Starfield)
 * Vanilla JavaScript Implementation for High-Performance Standalone Websites
 * Adapted from React Bits (reactbits.dev) Galaxy component.
 */
(function(window, document) {
  'use strict';

  const MAX_LAYERS = 8;
  const MAX_COLORS = 4;
  const INTRO_SECONDS = 2.2;

  const VERTEX = "#version 300 es\nin vec2 aPosition;\nvoid main() {\n  gl_Position = vec4(aPosition, 0.0, 1.0);\n}";

  const FRAGMENT = "#version 300 es\nprecision highp float;\nprecision highp int;\nuniform float uTime;\nuniform vec2 uResolution;\nuniform vec2 uFocal;\nuniform vec2 uRotation;\nuniform float uGloss;\nuniform float uDepth;\nuniform float uDensity;\nuniform float uHueShift;\nuniform float uSpeed;\nuniform vec2 uMouse;\nuniform float uStarGlow;\nuniform float uFlareGain;\nuniform float uSquash;\nuniform float uSaturation;\nuniform float uMouseRepulsion;\nuniform float uTwinkleIntensity;\nuniform float uRotationAngle;\nuniform float uRepulsionStrength;\nuniform float uMouseActiveFactor;\nuniform float uAutoCenterRepulsion;\nuniform int uLayers;\nuniform vec3 uColors[4];\nuniform int uColorCount;\nuniform float uWarp;\nuniform float uReveal;\nuniform float uMode;\nuniform vec3 uBackground;\nuniform float uOpacity;\nout vec4 outColor;\n\n#define STAR_COLOR_CUTOFF 0.2\n#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)\n#define PERIOD 3.0\n\nfloat Hash21(vec2 p) {\n  p = fract(p * vec2(123.34, 456.21));\n  p += dot(p, p + 45.32);\n  return fract(p.x * p.y);\n}\n\nfloat tri(float x) {\n  return abs(fract(x) * 2.0 - 1.0);\n}\n\nfloat tris(float x) {\n  float t = fract(x);\n  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));\n}\n\nfloat trisn(float x) {\n  float t = fract(x);\n  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;\n}\n\nvec3 hsv2rgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nfloat Star(vec2 uv, float flare, vec2 radial, float invReach) {\n#ifdef WARP\n  float along = dot(uv, radial);\n  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));\n#else\n  float d = length(uv);\n#endif\n  float m = uStarGlow / d;\n  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\n  m += rays * flare * uFlareGain;\n  uv *= MAT45;\n  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));\n  m += rays * 0.3 * flare * uFlareGain;\n  m *= smoothstep(1.0, 0.2, d * invReach);\n#ifdef WARP\n  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));\n#endif\n  return m;\n}\n\nvec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {\n  vec3 col = vec3(0.0);\n  vec2 gv = fract(uv) - 0.5;\n  vec2 id = floor(uv);\n  for (int y = -1; y <= 1; y++) {\n    for (int x = -1; x <= 1; x++) {\n      vec2 offset = vec2(float(x), float(y));\n      vec2 si = id + offset;\n      float seed = Hash21(si);\n      float size = fract(seed * 345.32);\n      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));\n      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;\n\n#ifdef PALETTE\n      float pick = Hash21(si + 7.0) * float(uColorCount);\n      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];\n#else\n      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;\n      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;\n      float grn = min(red, blu) * seed;\n      vec3 base = vec3(red, grn, blu);\n      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;\n      hue = fract(hue + uHueShift / 360.0);\n      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;\n      float val = max(max(base.r, base.g), base.b);\n      base = hsv2rgb(vec3(hue, sat, val));\n#endif\n\n      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;\n      vec2 shift = vec2(0.0);\n      float invReach = 1.0;\n#ifdef REPEL\n      vec2 away = si + 0.5 + pad - repelAt;\n      float dist = length(away);\n      float q = dist * spread;\n      float cells = pushCells * exp(-q * q);\n      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);\n      shift = away * (moved / max(dist, 0.0001));\n      invReach = 1.0 / (1.0 - moved);\n#endif\n      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);\n      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;\n      twinkle = mix(1.0, twinkle, uTwinkleIntensity);\n      col += star * twinkle * size * base;\n    }\n  }\n  return col;\n}\n\nvoid main() {\n  vec2 focalPx = uFocal * uResolution;\n  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;\n  vec2 mouseNorm = uMouse - vec2(0.5);\n\n  vec2 repelAt = vec2(0.0);\n  float strength = 0.0;\n  float push = 0.0;\n  if (uAutoCenterRepulsion > 0.0) {\n    strength = uAutoCenterRepulsion;\n    push = strength * 0.05;\n  } else if (uMouseRepulsion > 0.5) {\n    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;\n    strength = max(uRepulsionStrength, 0.0);\n    push = strength * 0.05 * uMouseActiveFactor;\n  } else {\n    uv += mouseNorm * 0.1 * uMouseActiveFactor;\n  }\n  float radius = 0.16 + 0.04 * strength;\n\n  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);\n  float angle = uRotationAngle;\n  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;\n  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;\n  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;\n  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;\n  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;\n  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;\n\n  vec3 col = vec3(0.0);\n  float layers = float(uLayers);\n  for (int k = 0; k < 8; k++) {\n    if (k >= uLayers) break;\n    float i = float(k) / layers;\n    float depth = fract(i + uDepth);\n    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);\n    float fade = depth * smoothstep(1.0, 0.9, depth);\n    vec2 offset = vec2(i * 453.32);\n    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;\n  }\n  col *= uReveal;\n\n  if (uMode > 1.5) {\n    vec3 lit = col * smoothstep(0.0, 0.3, length(col));\n    float energy = max(max(lit.r, lit.g), lit.b);\n    vec3 tint = lit / max(energy, 0.0001);\n    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));\n    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;\n    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);\n  } else if (uMode > 0.5) {\n    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;\n    outColor = vec4(col * alpha, alpha);\n  } else {\n    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);\n  }\n}";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const keyOf = (palette, repel, warp) => (palette ? 4 : 0) + (repel ? 2 : 0) + (warp ? 1 : 0);

  const start = (gl, palette, repel, warp) => {
    const defines = (palette ? '#define PALETTE\n' : '') + 
                    (repel ? '#define REPEL\n' : '') + 
                    (warp ? '#define WARP\n' : '');
    const program = gl.createProgram();
    const vertex = gl.createShader(gl.VERTEX_SHADER);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER);
    if (!program || !vertex || !fragment) return null;

    gl.shaderSource(vertex, VERTEX);
    gl.shaderSource(fragment, FRAGMENT.replace('\n', '\n' + defines));
    gl.compileShader(vertex);
    gl.compileShader(fragment);

    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
      console.warn('[Galaxy] Vertex shader error:', gl.getShaderInfoLog(vertex));
    }
    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
      console.warn('[Galaxy] Fragment shader error:', gl.getShaderInfoLog(fragment));
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return program;
  };

  const finish = (gl, program) => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  class Galaxy {
    constructor(container, options = {}) {
      if (!container) return;
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      // Extract options from data-attributes if available
      const ds = this.container.dataset || {};
      this.options = Object.assign({
        focal: [0.5, 0.5],
        rotation: [1.0, 0.0],
        starSpeed: ds.starSpeed !== undefined ? parseFloat(ds.starSpeed) : 0.3,
        density: ds.density !== undefined ? parseFloat(ds.density) : 1,
        hueShift: ds.hueShift !== undefined ? parseFloat(ds.hueShift) : 140,
        disableAnimation: false,
        speed: ds.speed !== undefined ? parseFloat(ds.speed) : 0.25,
        mouseInteraction: ds.mouseInteraction !== undefined ? ds.mouseInteraction !== 'false' : true,
        glowIntensity: ds.glowIntensity !== undefined ? parseFloat(ds.glowIntensity) : 0.3,
        saturation: ds.saturation !== undefined ? parseFloat(ds.saturation) : 0.0,
        mouseRepulsion: ds.mouseRepulsion !== undefined ? ds.mouseRepulsion === 'true' : false,
        repulsionStrength: ds.repulsionStrength !== undefined ? parseFloat(ds.repulsionStrength) : 2,
        twinkleIntensity: ds.twinkleIntensity !== undefined ? parseFloat(ds.twinkleIntensity) : 0.3,
        rotationSpeed: ds.rotationSpeed !== undefined ? parseFloat(ds.rotationSpeed) : 0.01,
        autoCenterRepulsion: ds.autoCenterRepulsion !== undefined ? parseFloat(ds.autoCenterRepulsion) : 0,
        transparent: true,
        lightMode: false,
        starColors: [],
        starSize: ds.starSize !== undefined ? parseFloat(ds.starSize) : 0.95,
        flareIntensity: ds.flareIntensity !== undefined ? parseFloat(ds.flareIntensity) : 1,
        layers: ds.layers !== undefined ? parseInt(ds.layers, 10) : 4,
        direction: 'forward',
        clickWarp: ds.clickWarp !== undefined ? ds.clickWarp === 'true' : false,
        intro: true,
        backgroundColor: null,
        opacity: ds.opacity !== undefined ? parseFloat(ds.opacity) : 1,
        dpr: undefined
      }, options);

      this.init();
    }

    init() {
      // Find or create canvas
      let canvas = this.container.querySelector('canvas.galaxy-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'galaxy-canvas';
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
        console.warn('[Galaxy] WebGL2 not supported in this environment.');
        return;
      }
      this.gl = gl;

      const parallel = gl.getExtension('KHR_parallel_shader_compile');
      this.programs = new Map();

      const entry = (palette, repel, warp) => {
        const key = keyOf(palette, repel, warp);
        let found = this.programs.get(key);
        if (!found) {
          found = { program: start(gl, palette, repel, warp), linked: null, done: false };
          this.programs.set(key, found);
        }
        return found;
      };

      const variant = (palette, repel, warp, wait) => {
        const found = entry(palette, repel, warp);
        if (!found.done && found.program) {
          if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;
          found.linked = finish(gl, found.program);
          found.done = true;
        }
        return found.linked;
      };

      const palette = Array.isArray(this.options.starColors) ? this.options.starColors.filter(Boolean).slice(0, MAX_COLORS) : [];
      if (!variant(palette.length > 0, false, false, true)) {
        this.programs.forEach(found => found.program && gl.deleteProgram(found.program));
        return;
      }

      this.buffer = gl.createBuffer();
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const cache = new Map();
      const parse = (value, fallback) => {
        if (!value) return fallback;
        const key = String(value);
        if (cache.has(key)) return cache.get(key);
        let rgb = fallback;
        if (probe) {
          probe.clearRect(0, 0, 1, 1);
          probe.fillStyle = '#000000';
          probe.fillStyle = key;
          probe.fillRect(0, 0, 1, 1);
          const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
          rgb = [r / 255, g / 255, b / 255];
        }
        cache.set(key, rgb);
        return rgb;
      };

      const colors = new Float32Array(MAX_COLORS * 3);
      const pointer = { x: 0.5, y: 0.5, inside: false };
      const state = {
        time: 0,
        gloss: 0,
        depth: 0,
        angle: 0,
        mx: 0.5,
        my: 0.5,
        active: 0,
        boost: 0,
        reveal: this.options.intro && !reduce ? 0 : 1
      };

      let raf = 0;
      let last = 0;
      let visible = true;

      const render = () => {
        const s = this.options;
        palette.forEach((value, index) => colors.set(parse(value, [1, 1, 1]), index * 3));
        const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;
        const background = parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]);
        const reveal = state.reveal;
        const hasPalette = palette.length > 0;
        const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);
        const warp = state.boost > 0;
        const base = variant(hasPalette, false, false, true);
        if (!base) return;

        const prog = (repel || warp ? variant(hasPalette, repel, warp, false) : null) ?? base;
        const u = prog.uniforms;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(prog.program);
        gl.bindVertexArray(this.vao);

        gl.uniform1f(u.uTime, state.time);
        gl.uniform2f(u.uResolution, canvas.width, canvas.height);
        gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);
        gl.uniform2f(u.uRotation, s.rotation[0], s.rotation[1]);
        gl.uniform1f(u.uGloss, state.gloss);
        gl.uniform1f(u.uDepth, state.depth);
        gl.uniform1f(u.uDensity, s.density);
        gl.uniform1f(u.uHueShift, s.hueShift);
        gl.uniform1f(u.uSpeed, s.speed);
        gl.uniform2f(u.uMouse, state.mx, state.my);

        const stretch = 1 + state.boost * 5;
        gl.uniform1f(u.uStarGlow, (0.05 * s.glowIntensity * s.starSize) / Math.pow(stretch, 0.6));
        gl.uniform1f(u.uFlareGain, s.glowIntensity * s.flareIntensity);
        gl.uniform1f(u.uSquash, 1 - 1 / (stretch * stretch));
        gl.uniform1f(u.uSaturation, s.saturation);
        gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);
        gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);
        gl.uniform1f(u.uRotationAngle, state.angle);
        gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);
        gl.uniform1f(u.uMouseActiveFactor, state.active);
        gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);
        gl.uniform1i(u.uLayers, clamp(Math.round(s.layers), 2, MAX_LAYERS));
        gl.uniform3fv(u.uColors, colors);
        gl.uniform1i(u.uColorCount, palette.length);
        gl.uniform1f(u.uWarp, state.boost);

        const fade = Math.min(1, reveal / 0.35);
        gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));
        gl.uniform1f(u.uMode, mode);
        gl.uniform3fv(u.uBackground, background);
        gl.uniform1f(u.uOpacity, clamp(s.opacity, 0, 1));

        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const frame = now => {
        raf = 0;
        if (!visible || document.hidden) return;
        const s = this.options;
        const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
        last = now;
        const motion = s.disableAnimation || reduce ? 0 : 1;
        if (s.intro && !reduce && state.reveal < 1) {
          state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);
          state.boost = Math.max(state.boost, Math.pow(1 - state.reveal, 2) * 1.4);
        } else if (!s.intro || reduce) {
          state.reveal = 1;
        }

        const flight = (s.starSpeed / 10) * (s.direction === 'backward' ? -1 : 1);
        state.time += dt * motion;
        state.gloss += dt * flight * motion;
        state.depth += dt * flight * s.speed * motion * (1 + state.boost * 14);
        state.angle += dt * s.rotationSpeed * motion;
        state.boost *= Math.exp(-dt * 1.3);
        if (state.boost < 0.001) state.boost = 0;

        const follow = 1 - Math.exp(-dt / 0.325);
        const engaged = s.mouseInteraction && pointer.inside && !reduce;
        if (engaged) {
          state.mx += (pointer.x - state.mx) * follow;
          state.my += (pointer.y - state.my) * follow;
        }
        const target = engaged ? 1 : 0;
        state.active += (target - state.active) * follow;
        if (Math.abs(target - state.active) < 0.001) state.active = target;

        render();
        const busy = motion > 0 || state.boost > 0 || state.active !== target || state.reveal < 1;
        if (busy) raf = requestAnimationFrame(frame);
        else last = 0;
      };

      const wake = () => {
        if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };

      const resize = () => {
        const s = this.options;
        const width = Math.max(1, this.container.clientWidth);
        const height = Math.max(1, this.container.clientHeight);
        const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        render();
        wake();
      };

      const locate = event => {
        const rect = this.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        pointer.x = x / Math.max(1, rect.width);
        pointer.y = 1 - y / Math.max(1, rect.height);
      };

      const onPointerMove = event => {
        locate(event);
        wake();
      };

      const onPointerDown = event => {
        const s = this.options;
        locate(event);
        if (!pointer.inside || !s.clickWarp || reduce) return;
        state.boost = Math.min(1.6, state.boost + 1);
        wake();
      };

      const onPointerUp = event => {
        if (event.pointerType !== 'mouse') pointer.inside = false;
      };

      const onPointerLeave = () => {
        pointer.inside = false;
      };

      const onVisibility = () => {
        last = 0;
        wake();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(this.container);

      const intersection = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) {
          last = 0;
          wake();
        }
      });
      intersection.observe(this.container);

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
      document.addEventListener('visibilitychange', onVisibility);

      resize();

      const repelling = this.options.autoCenterRepulsion > 0 || (this.options.mouseInteraction && this.options.mouseRepulsion);
      const tinted = palette.length > 0;
      if (this.options.clickWarp || this.options.intro) entry(tinted, false, true);
      if (repelling) entry(tinted, true, false);
      if (repelling && this.options.clickWarp) entry(tinted, true, true);

      this.destroy = () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        document.documentElement.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        this.programs.forEach(found => found.program && gl.deleteProgram(found.program));
        gl.deleteBuffer(this.buffer);
        gl.deleteVertexArray(this.vao);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    }
  }

  // Auto-initialize elements with data-galaxy="true" or #about-galaxy
  function initAllGalaxies() {
    const targets = document.querySelectorAll('[data-galaxy="true"], #about-galaxy, .galaxy-container');
    targets.forEach(el => {
      if (!el._galaxyInstance) {
        el._galaxyInstance = new Galaxy(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllGalaxies);
  } else {
    initAllGalaxies();
  }

  window.Galaxy = Galaxy;
})(window, document);
