/**
 * Threads Component (Vanilla JavaScript + WebGL 2 Implementation)
 * Based on React Bits <Threads /> component.
 * Features:
 * - Fluid organic wave ribbons driven by Perlin2D noise
 * - Dynamic split and fray progression across instanced strips
 * - Interactive pointer steering (mouse X shifts waves, mouse Y alters amplitude)
 * - Screen-space smoothing, brightness curve, and soft edge dissipation
 * - Zero CPU waste when offscreen (IntersectionObserver & visibility auto-pause)
 */

(function (global) {
  'use strict';

  const LINE_VERTEX = `#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uSeed;
uniform vec2 uTurn;
uniform vec4 uPart;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  float splitPoint = uSplit + perc * uFray;
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  if (uPart.z > 0.0) {
    vec2 delta = local - uPart.xy;
    float reach = uPart.w;
    float pull = exp(-dot(delta, delta) / (reach * reach));
    local.y += delta.y * pull * uPart.z;
  }
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`;

  const LINE_FRAGMENT = `#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`;

  const SCREEN_VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const SCREEN_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uLines;
uniform vec2 uResolution;
uniform float uFade;
uniform float uOpacity;
uniform float uCurve;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 lines = texture(uLines, vUv);
  float alpha = lines.a;
  if (alpha < 0.001) {
    outColor = vec4(0.0);
    return;
  }
  vec3 color = lines.rgb / alpha;
  float mask = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  float finalAlpha = clamp(alpha * mask, 0.0, 1.0);
  outColor = vec4(color * pow(alpha, uCurve) * finalAlpha, finalAlpha);
}`;

  const MAX_RENDER_DIM = 1920;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    const err = gl.getShaderInfoLog(shader);
    console.warn('[Threads] Shader compile error:', err);
    gl.deleteShader(shader);
    return null;
  };

  const link = (gl, vertexSource, fragmentSource) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
    const err = gl.getProgramInfoLog(program);
    console.warn('[Threads] Program link error:', err);
    gl.deleteProgram(program);
    return null;
  };

  const locate = (gl, program, names) => {
    const result = {};
    for (const name of names) result[name] = gl.getUniformLocation(program, name);
    return result;
  };

  class ThreadsInstance {
    constructor(element, options = {}) {
      this.container = element;
      this.container._threadsInstance = this;

      const ds = element.dataset || {};

      this.options = Object.assign(
        {
          color: '#ffffff',
          accentColor: '#7fa8ff',
          amplitude: 1.7,
          distance: 0.4,
          enableMouseInteraction: true,
          lineCount: 90,
          thickness: 0.6,
          softness: 1.3,
          speed: 0.6,
          waves: 1.05,
          split: 0.04,
          fray: 0.5,
          angle: 25,
          seed: 0,
          parting: 0,
          taper: 0.85,
          brightness: 1.4,
          fade: 0,
          opacity: 1,
          paused: false
        },
        options
      );

      // Read dataset overrides if present
      if (ds.color) this.options.color = ds.color;
      if (ds.accentColor) this.options.accentColor = ds.accentColor;
      if (ds.amplitude) this.options.amplitude = parseFloat(ds.amplitude);
      if (ds.distance) this.options.distance = parseFloat(ds.distance);
      if (ds.enableMouseInteraction !== undefined) {
        this.options.enableMouseInteraction = ds.enableMouseInteraction === 'true';
      }
      if (ds.lineCount) this.options.lineCount = parseInt(ds.lineCount, 10);
      if (ds.thickness) this.options.thickness = parseFloat(ds.thickness);
      if (ds.softness) this.options.softness = parseFloat(ds.softness);
      if (ds.speed) this.options.speed = parseFloat(ds.speed);
      if (ds.waves) this.options.waves = parseFloat(ds.waves);
      if (ds.split) this.options.split = parseFloat(ds.split);
      if (ds.fray) this.options.fray = parseFloat(ds.fray);
      if (ds.angle) this.options.angle = parseFloat(ds.angle);
      if (ds.seed) this.options.seed = parseFloat(ds.seed);
      if (ds.parting) this.options.parting = parseFloat(ds.parting);
      if (ds.taper) this.options.taper = parseFloat(ds.taper);
      if (ds.brightness) this.options.brightness = parseFloat(ds.brightness);
      if (ds.fade) this.options.fade = parseFloat(ds.fade);
      if (ds.opacity) this.options.opacity = parseFloat(ds.opacity);

      this.canvas = null;
      this.gl = null;
      this.lineProgram = null;
      this.screenProgram = null;
      this.lineUniforms = null;
      this.screenUniforms = null;
      this.lineVao = null;
      this.screenVao = null;
      this.lineBuffer = null;
      this.screenBuffer = null;
      this.target = null;
      this.framebuffer = null;
      this.probeContext = null;

      this.state = {
        time: 0,
        width: 1,
        height: 1,
        segments: 0,
        colorKey: '',
        color: [1, 1, 1],
        accent: [0.5, 0.66, 1.0],
        mouse: [0.5, 0.5],
        targetMouse: [0.5, 0.5],
        pointer: [0, 0],
        targetPointer: [0, 0],
        presence: 0,
        inside: false
      };

      this.raf = 0;
      this.last = 0;
      this.visible = true;
      this.alive = true;

      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerLeave = this.onPointerLeave.bind(this);
      this.onVisibility = this.onVisibility.bind(this);
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);

      this.init();
    }

    getSettings() {
      const o = this.options;
      const colorKey = `${Array.isArray(o.color) ? o.color.join(',') : String(o.color)}|${
        Array.isArray(o.accentColor) ? o.accentColor.join(',') : String(o.accentColor ?? '')
      }`;
      return {
        color: o.color,
        accentColor: o.accentColor,
        colorKey,
        amplitude: o.amplitude,
        distance: o.distance,
        enableMouseInteraction: o.enableMouseInteraction,
        lineCount: clamp(Math.round(o.lineCount), 1, 400),
        thickness: Math.max(0, o.thickness),
        softness: Math.max(0, o.softness),
        speed: o.speed,
        waves: Math.max(0, o.waves),
        split: clamp(o.split, 0, 1),
        fray: clamp(o.fray, 0, 1),
        angle: o.angle,
        seed: o.seed,
        parting: clamp(o.parting, 0, 1),
        taper: clamp(o.taper, 0, 1),
        brightness: clamp(o.brightness, 0.25, 2),
        fade: clamp(o.fade, 0, 1),
        opacity: clamp(o.opacity, 0, 1),
        paused: o.paused
      };
    }

    toRgb(value) {
      if (Array.isArray(value)) return [0, 1, 2].map((i) => clamp(Number(value[i] ?? 1), 0, 1));
      if (!this.probeContext) return [1, 1, 1];
      this.probeContext.clearRect(0, 0, 1, 1);
      this.probeContext.fillStyle = '#ffffff';
      this.probeContext.fillStyle = String(value);
      this.probeContext.fillRect(0, 0, 1, 1);
      const [r, g, b] = this.probeContext.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255];
    }

    resolveColors(s) {
      if (s.colorKey === this.state.colorKey) return;
      this.state.colorKey = s.colorKey;
      this.state.color = this.toRgb(s.color);
      this.state.accent = s.accentColor === undefined || s.accentColor === null ? this.state.color : this.toRgb(s.accentColor);
    }

    buildStrip(segments) {
      const gl = this.gl;
      if (segments === this.state.segments) return;
      this.state.segments = segments;
      const points = new Float32Array((segments + 1) * 4);
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        points.set([u, -1, u, 1], i * 4);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    }

    init() {
      const container = this.container;
      container.classList.add('threads-container');

      let canvas = container.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'threads-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);
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
        console.warn('Threads: WebGL2 not supported.');
        return;
      }
      this.gl = gl;

      const lineProgram = link(gl, LINE_VERTEX, LINE_FRAGMENT);
      const screenProgram = link(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);
      if (!lineProgram || !screenProgram) return;

      this.lineProgram = lineProgram;
      this.screenProgram = screenProgram;

      this.lineUniforms = locate(gl, lineProgram, [
        'uTime',
        'uResolution',
        'uFrame',
        'uAmplitude',
        'uDistance',
        'uMouse',
        'uCount',
        'uThickness',
        'uSoftness',
        'uWaves',
        'uSplit',
        'uFray',
        'uSeed',
        'uTurn',
        'uPart',
        'uTaper',
        'uColor',
        'uAccent'
      ]);
      this.screenUniforms = locate(gl, screenProgram, ['uLines', 'uResolution', 'uFade', 'uOpacity', 'uCurve']);

      this.lineVao = gl.createVertexArray();
      this.lineBuffer = gl.createBuffer();
      gl.bindVertexArray(this.lineVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
      const pointLocation = gl.getAttribLocation(lineProgram, 'aPoint');
      gl.enableVertexAttribArray(pointLocation);
      gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, 0, 0);

      this.screenVao = gl.createVertexArray();
      this.screenBuffer = gl.createBuffer();
      gl.bindVertexArray(this.screenVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.screenBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const positionLocation = gl.getAttribLocation(screenProgram, 'aPosition');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      this.target = gl.createTexture();
      this.framebuffer = gl.createFramebuffer();
      gl.bindTexture(gl.TEXTURE_2D, this.target);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const probe = document.createElement('canvas');
      probe.width = 1;
      probe.height = 1;
      this.probeContext = probe.getContext('2d', { willReadFrequently: true });

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(container);

      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        if (this.visible) {
          this.last = 0;
          this.wake();
        }
      });
      this.intersectionObserver.observe(container);

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.onVisibility);
      window.addEventListener('resize', this.resize);
      window.addEventListener('load', this.resize);

      this.resize();
      this.wake();
      requestAnimationFrame(this.resize);
      setTimeout(this.resize, 50);
      setTimeout(this.resize, 200);
      setTimeout(this.resize, 600);
    }

    resize() {
      const container = this.container;
      const canvas = this.canvas;
      const gl = this.gl;
      if (!container || !canvas || !gl) return;

      const rect = container.getBoundingClientRect();
      const parent = container.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : null;

      const rawWidth =
        rect.width ||
        container.clientWidth ||
        (parentRect ? parentRect.width : 0) ||
        (parent ? parent.clientWidth : 0) ||
        window.innerWidth;

      const rawHeight =
        rect.height ||
        container.clientHeight ||
        (parentRect ? parentRect.height : 0) ||
        (parent ? parent.clientHeight : 0) ||
        window.innerHeight;

      const width = Math.max(1, Math.round(rawWidth));
      const height = Math.max(1, Math.round(rawHeight));
      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);
      const longest = Math.max(width, height) * baseDpr;
      const dpr = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;
      const targetW = Math.max(1, Math.round(width * dpr));
      const targetH = Math.max(1, Math.round(height * dpr));

      if (canvas.width === targetW && canvas.height === targetH && this.state.width === width && this.state.height === height) {
        return;
      }

      canvas.width = targetW;
      canvas.height = targetH;
      this.state.width = width;
      this.state.height = height;

      gl.bindTexture(gl.TEXTURE_2D, this.target);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.target, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this.buildStrip(clamp(Math.round(width / 3), 96, 640));
      this.render();
    }

    render() {
      const gl = this.gl;
      const canvas = this.canvas;
      if (!gl || !canvas) return;

      const s = this.getSettings();
      this.resolveColors(s);

      const w = canvas.width;
      const h = canvas.height;
      const radians = (s.angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const length = Math.abs(w * cos) + Math.abs(h * sin);
      const across = Math.abs(w * sin) + Math.abs(h * cos);
      const scale = w / this.state.width;
      const mouse = s.enableMouseInteraction ? this.state.mouse : [0.5, 0.5];
      const strength = s.parting * this.state.presence * 2;
      const px = this.state.pointer[0] * scale;
      const py = this.state.pointer[1] * scale;
      const local = [px * cos + py * sin, -px * sin + py * cos];

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.lineProgram);
      gl.uniform1f(this.lineUniforms.uTime, this.state.time);
      gl.uniform2f(this.lineUniforms.uResolution, w, h);
      gl.uniform2f(this.lineUniforms.uFrame, length, across);
      gl.uniform1f(this.lineUniforms.uAmplitude, s.amplitude);
      gl.uniform1f(this.lineUniforms.uDistance, s.distance);
      gl.uniform2f(this.lineUniforms.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(this.lineUniforms.uCount, s.lineCount);
      gl.uniform1f(this.lineUniforms.uThickness, s.thickness);
      gl.uniform1f(this.lineUniforms.uSoftness, s.softness);
      gl.uniform1f(this.lineUniforms.uWaves, s.waves);
      gl.uniform1f(this.lineUniforms.uSplit, s.split);
      gl.uniform1f(this.lineUniforms.uFray, s.fray);
      gl.uniform1f(this.lineUniforms.uSeed, s.seed * 13.37);
      gl.uniform2f(this.lineUniforms.uTurn, cos, sin);
      gl.uniform4f(this.lineUniforms.uPart, local[0], local[1], strength, Math.min(w, h) * 0.16);
      gl.uniform1f(this.lineUniforms.uTaper, s.taper);
      gl.uniform3f(this.lineUniforms.uColor, this.state.color[0], this.state.color[1], this.state.color[2]);
      gl.uniform3f(this.lineUniforms.uAccent, this.state.accent[0], this.state.accent[1], this.state.accent[2]);
      gl.bindVertexArray(this.lineVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (this.state.segments + 1) * 2, s.lineCount);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.disable(gl.BLEND);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.screenProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.target);
      gl.uniform1i(this.screenUniforms.uLines, 0);
      gl.uniform2f(this.screenUniforms.uResolution, w, h);
      gl.uniform1f(this.screenUniforms.uFade, s.fade);
      gl.uniform1f(this.screenUniforms.uOpacity, s.opacity);
      gl.uniform1f(this.screenUniforms.uCurve, 2 / s.brightness);
      gl.bindVertexArray(this.screenVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    }

    frame(now) {
      this.raf = 0;
      if (!this.alive || !this.visible || document.hidden) return;
      const s = this.getSettings();
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60;
      this.last = now;

      const r = this.container.getBoundingClientRect();
      const curW = Math.round(r.width || this.container.clientWidth);
      const curH = Math.round(r.height || this.container.clientHeight);
      if (curW > 1 && curH > 1 && (curW !== this.state.width || curH !== this.state.height)) {
        this.resize();
      }

      const moving = !s.paused && !reduce;
      if (moving) this.state.time += dt * s.speed;
      const follow = 1 - Math.exp(-dt * 3);
      this.state.mouse[0] += (this.state.targetMouse[0] - this.state.mouse[0]) * follow;
      this.state.mouse[1] += (this.state.targetMouse[1] - this.state.mouse[1]) * follow;
      const glide = 1 - Math.exp(-dt * 10);
      this.state.pointer[0] += (this.state.targetPointer[0] - this.state.pointer[0]) * glide;
      this.state.pointer[1] += (this.state.targetPointer[1] - this.state.pointer[1]) * glide;
      this.state.presence += ((this.state.inside && s.parting > 0 ? 1 : 0) - this.state.presence) * (1 - Math.exp(-dt * 4));

      this.render();

      const settling =
        Math.abs(this.state.targetMouse[0] - this.state.mouse[0]) > 0.0005 ||
        Math.abs(this.state.targetMouse[1] - this.state.mouse[1]) > 0.0005 ||
        Math.abs(this.state.targetPointer[0] - this.state.pointer[0]) > 0.05 ||
        Math.abs(this.state.targetPointer[1] - this.state.pointer[1]) > 0.05 ||
        Math.abs((this.state.inside && s.parting > 0 ? 1 : 0) - this.state.presence) > 0.002;

      if (moving || settling) this.raf = requestAnimationFrame(this.frame);
      else this.last = 0;
    }

    wake() {
      if (!this.raf && this.alive && this.visible && !document.hidden) {
        this.raf = requestAnimationFrame(this.frame);
      }
    }

    onPointerMove(event) {
      const container = this.container;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (inside) {
        this.state.targetMouse = [x, 1 - y];
        this.state.targetPointer = [
          event.clientX - rect.left - rect.width / 2,
          rect.height / 2 - (event.clientY - rect.top)
        ];
        if (!this.state.inside && this.state.presence < 0.01) {
          this.state.pointer = [...this.state.targetPointer];
        }
      } else if (this.state.inside) {
        this.state.targetMouse = [0.5, 0.5];
      }
      this.state.inside = inside;
      this.wake();
    }

    onPointerLeave() {
      this.state.inside = false;
      this.state.targetMouse = [0.5, 0.5];
      this.wake();
    }

    onVisibility() {
      this.last = 0;
      this.wake();
    }

    destroy() {
      this.alive = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      window.removeEventListener('pointermove', this.onPointerMove);
      document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
      document.removeEventListener('visibilitychange', this.onVisibility);

      const gl = this.gl;
      if (gl) {
        gl.deleteFramebuffer(this.framebuffer);
        gl.deleteTexture(this.target);
        gl.deleteBuffer(this.lineBuffer);
        gl.deleteBuffer(this.screenBuffer);
        gl.deleteVertexArray(this.lineVao);
        gl.deleteVertexArray(this.screenVao);
        gl.deleteProgram(this.lineProgram);
        gl.deleteProgram(this.screenProgram);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  function initThreads(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return null;
    return new ThreadsInstance(container, options);
  }

  function autoInit() {
    const elements = document.querySelectorAll('[data-threads="true"], .threads-container');
    elements.forEach((el) => {
      if (el._threadsInstance) return;
      el._threadsInstance = new ThreadsInstance(el);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  global.Threads = {
    init: initThreads,
    Instance: ThreadsInstance
  };
})(typeof window !== 'undefined' ? window : this);
