/**
 * Ferrofluid Component (Vanilla JavaScript + WebGL 2 Implementation)
 * Based on React Bits <Ferrofluid /> component.
 * Features:
 * - Raymarched magnetic ferrofluid simulation with procedural spike crowns
 * - Interactive pointer magnet attracting fluid spikes with inertia & dampening
 * - Magnetic shockwave click pulse propagating across surface
 * - Studio lighting reflections, fresnel rim lighting, and specular highlights
 * - Zero CPU waste when offscreen (IntersectionObserver & visibility auto-pause)
 */

(function (global) {
  'use strict';

  const CELL = 1 / 3;
  const BOUND_CELL = 1;
  const INTRO_SECONDS = 2.4;
  const FOV = (38 * Math.PI) / 180;
  const FLOW = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0], none: [0, 0] };

  const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const SIM_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uGridOrigin;
uniform float uCell;
uniform float uDt;
uniform float uTime;
uniform vec2 uFlow;
uniform float uTurbulence;
uniform float uMagnetism;
uniform float uFieldScale;
uniform vec2 uSeed;
uniform vec4 uCursor;
uniform vec4 uPulse;
uniform float uPulseSpeed;
uniform float uPulseWidth;
uniform vec3 uIntro;
uniform float uSpikeHeight;
uniform float uMound;
uniform float uStiffness;
uniform float uDamping;
uniform float uSettle;
out vec4 outState;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float flowField(vec2 p) {
  vec2 q = p / uFieldScale + uSeed;
  vec2 drift = uFlow * uTime * 0.55;
  vec2 warp = vec2(noise(q * 0.6 + vec2(uTime * 0.07, 3.1)), noise(q * 0.6 - vec2(7.3, uTime * 0.06))) - 0.5;
  vec2 r = q + warp * 1.8 * uTurbulence - drift;
  float n = noise(r) * 0.65 + noise(r * 2.03 + 11.7 - drift * 0.5) * 0.35;
  return smoothstep(0.44, 0.86, n);
}

void main() {
  vec2 texel = floor(gl_FragCoord.xy);
  vec2 p = uGridOrigin + (texel + 0.5) * uCell;
  vec4 prev = texelFetch(uState, ivec2(texel), 0);
  float swell = flowField(p);
  float field = uMagnetism * (0.03 + 1.0 * swell * swell);
  vec2 dc = p - uCursor.xy;
  float falloff = dot(dc, dc) / (uCursor.w * uCursor.w);
  field += uCursor.z * exp(-falloff);
  float mound = uCursor.z * exp(-falloff / 2.2);
  if (uPulse.w > 0.0) {
    float ring = length(p - uPulse.xy) - uPulse.z * uPulseSpeed;
    float envelope = smoothstep(0.0, 0.08, uPulse.z) * exp(-uPulse.z * 1.1);
    field += uPulse.w * envelope * exp(-ring * ring / (uPulseWidth * uPulseWidth));
  }
  float front = clamp((uIntro.z - length(p - uIntro.xy)) / 3.0, 0.0, 1.0);
  front = front * front * (3.0 - 2.0 * front);
  float target = uSpikeHeight * min(pow(max(field * front - 0.04, 0.0), 1.6), 1.0);
  float height = prev.x;
  float velocity = prev.y;
  if (uSettle > 0.5) {
    height = target;
    velocity = 0.0;
  } else {
    float steps = ceil(uDt / 0.008);
    float h = uDt / steps;
    for (int k = 0; k < 8; k++) {
      if (float(k) >= steps) break;
      velocity += (uStiffness * (target - height) - uDamping * velocity) * h;
      height += velocity * h;
    }
    if (height < 0.0) {
      height = 0.0;
      velocity = max(velocity, 0.0);
    }
  }
  outState = vec4(height, velocity, mound * front * uMound, 1.0);
}`;

  const BOUND_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uGridOrigin;
uniform float uCell;
uniform vec2 uStateSize;
uniform float uBoundCell;
out vec4 outBound;

void main() {
  vec2 center = uGridOrigin + (floor(gl_FragCoord.xy) + 0.5) * uBoundCell;
  vec2 base = floor((center - uGridOrigin) / uCell);
  float top = 0.0;
  float peak = 0.0;
  for (int y = -4; y <= 4; y++) {
    for (int x = -4; x <= 4; x++) {
      vec2 texel = clamp(base + vec2(float(x), float(y)), vec2(0.0), uStateSize - 1.0);
      vec4 s = texelFetch(uState, ivec2(texel), 0);
      top = max(top, max(s.x, 0.0) * 1.05 + s.z);
      peak = max(peak, s.x);
    }
  }
  outBound = vec4(top, peak, 0.0, 1.0);
}`;

  const RENDER_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform sampler2D uBound;
uniform vec2 uGridOrigin;
uniform vec2 uGridSpan;
uniform vec2 uBoundSpan;
uniform float uCellSize;
uniform vec2 uResolution;
uniform vec3 uCamera;
uniform vec3 uForward;
uniform vec3 uUpward;
uniform float uTanHalf;
uniform float uPixelAngle;
uniform float uFar;
uniform float uFogStart;
uniform float uTop;
uniform float uBottom;
uniform float uTime;
uniform vec4 uCursor;
uniform float uMound;
uniform float uRound;
uniform float uSpan;
uniform float uExponent;
uniform float uWarp;
uniform vec3 uKey;
uniform vec3 uStrip;
uniform vec3 uFill;
uniform float uExposure;
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBase;
uniform float uOpacity;
out vec4 outColor;

const float G = 7.2551975;
const vec2 E1 = vec2(0.8660254, 0.5);
const vec2 E2 = vec2(-0.8660254, 0.5);
const vec2 E3 = vec2(0.0, -1.0);
const mat2 TURN = mat2(0.9902681, 0.1391731, -0.1391731, 0.9902681);
const float F0 = 0.06;

vec3 mound(vec2 p) {
  vec2 d = p - uCursor.xy;
  float inv = 1.0 / (uCursor.w * uCursor.w * 2.2);
  float e = uCursor.z * exp(-dot(d, d) * inv);
  return vec3(e, -2.0 * inv * e * d) * uMound;
}

vec2 lattice(vec2 p) {
  vec2 q = TURN * p;
  float t = uTime * 0.35;
  return q + uWarp * vec2(sin(q.y * 0.9 + t), cos(q.x * 0.8 - t * 0.8));
}

float detail(float t) {
  return smoothstep(3.0, 8.0, 1.0 / max(t * uPixelAngle, 1e-5)) * (1.0 - smoothstep(uFogStart, mix(uFogStart, uFar, 0.7), t));
}

float profile(float u, out float rate) {
  float root = sqrt(max(1.0 - u, 0.0) + uRound * uRound);
  rate = 0.5 / (uSpan * root);
  return clamp(1.0 - (root - uRound) / uSpan, 0.0, 1.0);
}

float spikes(vec2 p, float a, float rise, out float clearance) {
  clearance = 10.0;
  if (a < 0.002) return 0.0;
  vec2 q = lattice(p);
  float u = (cos(G * dot(E1, q)) + cos(G * dot(E2, q)) + cos(G * dot(E3, q)) + 1.5) / 4.5;
  if (a > 0.05) {
    float root = uRound + (1.0 - pow(clamp(rise / a, 0.0, 1.0), 1.0 / uExponent)) * uSpan;
    clearance = sqrt(max(1.0 - u, 0.0) / 8.77) - sqrt(max(root * root - uRound * uRound, 0.0) / 8.77);
  }
  float rate;
  return a * pow(profile(u, rate), uExponent);
}

vec2 spikesSlope(vec2 p, float a, vec2 aSlope) {
  if (a < 0.002) return vec2(0.0);
  vec2 q = lattice(p);
  float c1 = G * dot(E1, q);
  float c2 = G * dot(E2, q);
  float c3 = G * dot(E3, q);
  float u = (cos(c1) + cos(c2) + cos(c3) + 1.5) / 4.5;
  vec2 du = -(G / 4.5) * (sin(c1) * E1 + sin(c2) * E2 + sin(c3) * E3) * TURN;
  float rate;
  float s = max(profile(u, rate), 1e-4);
  float shape = pow(s, uExponent);
  return a * uExponent * shape / s * rate * du + aSlope * shape;
}

float surface(vec2 p, float z, float t, out float clearance) {
  vec4 f = texture(uField, (p - uGridOrigin) / uGridSpan);
  return f.z + spikes(p, f.x * detail(t), z - f.z, clearance);
}

vec2 bound(vec2 p) {
  return texture(uBound, (p - uGridOrigin) / uBoundSpan).rg;
}

float panel(vec3 r, vec3 dir, vec3 up, vec2 extent, float soft) {
  vec3 side = normalize(cross(dir, up));
  vec3 top = cross(side, dir);
  float facing = dot(r, dir);
  if (facing <= 0.0) return 0.0;
  vec2 q = vec2(dot(r, side), dot(r, top)) / facing;
  vec2 e = smoothstep(extent + soft, extent - soft, abs(q));
  return e.x * e.y;
}

vec3 studio(vec3 r, vec3 rd, float soft) {
  vec3 z = vec3(0.0, 0.0, 1.0);
  vec3 col = uKey * 4.2 * panel(r, normalize(vec3(-0.3, -0.5, 0.81)), z, vec2(0.36, 0.22), 0.08 + soft);
  col += uStrip * 1.5 * panel(r, normalize(vec3(-0.9, -0.2, 0.38)), z, vec2(0.12, 0.7), 0.07 + soft);
  col += uStrip * 1.5 * panel(r, normalize(vec3(0.9, -0.1, 0.42)), z, vec2(0.12, 0.7), 0.07 + soft);
  float lift = asin(clamp(r.z, -1.0, 1.0)) - asin(clamp(-rd.z, -1.0, 1.0));
  col += uFill * 0.45 * smoothstep(0.08 - soft, 0.7 + soft, lift) * smoothstep(1.6, 1.0, lift);
  return col;
}

vec4 finish(vec3 light, vec3 paper, float alpha) {
  if (uLight > 0.5) {
    if (uOpaque > 0.5) return vec4(mix(uBase, paper, alpha) * uOpacity, uOpacity);
    vec3 shade = mix(vec3(1.0), paper, alpha * uOpacity);
    float cover = 1.0 - min(shade.r, min(shade.g, shade.b));
    return vec4(shade - (1.0 - cover), cover);
  }
  vec3 glow = light * alpha * uOpacity;
  if (uOpaque > 0.5) return vec4(uBase + glow, 1.0);
  return vec4(glow, max(glow.r, max(glow.g, glow.b)));
}

void main() {
  vec2 ndc = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * uResolution.y);
  vec3 side = normalize(cross(uForward, uUpward));
  vec3 rd = normalize(uForward + (ndc.x * side + ndc.y * uUpward) * uTanHalf);
  if (rd.z > -0.004) {
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);
    return;
  }
  float tTop = max((uTop - uCamera.z) / rd.z, 0.0);
  float tEnd = min((uBottom - uCamera.z) / rd.z, uFar);
  if (tTop >= tEnd) {
    outColor = finish(vec3(0.0), vec3(1.0), 0.0);
    return;
  }
  float sink = max(-rd.z, 0.2);
  float glide = max(length(rd.xy), 0.05);
  float chunk = 0.9 / glide;
  float t = tEnd;
  float tPrev = tEnd;
  bool found = false;
  bool smoothHit = false;
  float t0 = tTop;
  vec2 b0 = bound(uCamera.xy + rd.xy * t0);
  for (int c = 0; c < 64; c++) {
    if (t0 >= tEnd) break;
    float t1 = min(t0 + chunk, tEnd);
    vec2 b1 = bound(uCamera.xy + rd.xy * t1);
    float b = max(b0.x, b1.x) + 0.03;
    float z1 = uCamera.z + rd.z * t1;
    if (z1 > b) {
      t0 = t1;
      b0 = b1;
      continue;
    }
    float tt = max(t0, (b - uCamera.z) / rd.z);
    if (max(b0.y, b1.y) < 0.002) {
      for (int k = 0; k < 3; k++) {
        vec3 probe = uCamera + rd * tt;
        tt += (probe.z - mound(probe.xy).x) / sink * 0.95;
      }
      if (tt <= t1 + 0.02 || t1 >= tEnd) {
        t = tt;
        smoothHit = true;
        break;
      }
      t0 = t1;
      b0 = b1;
      continue;
    }
    float tp = tt;
    for (int k = 0; k < 48; k++) {
      vec3 pos = uCamera + rd * tt;
      float clearance;
      float gap = pos.z - surface(pos.xy, pos.z, tt, clearance);
      if (gap < 0.0) {
        found = true;
        break;
      }
      tp = tt;
      float pixel = tt * uPixelAngle;
      float limit = pos.z > bound(pos.xy).x + 0.02 ? 0.6 / glide : max(clearance * 0.9, pixel) / glide;
      tt += max(min(gap * 0.75 / sink, limit), pixel);
      if (tt > t1) break;
    }
    if (found) {
      t = tt;
      tPrev = tp;
      break;
    }
    t0 = t1;
    b0 = b1;
  }

  vec3 pos;
  vec2 slope;
  if (smoothHit || !found) {
    pos = uCamera + rd * t;
    slope = mound(pos.xy).yz;
  } else {
    float lo = tPrev;
    float hi = t;
    for (int k = 0; k < 4; k++) {
      float mid = 0.5 * (lo + hi);
      vec3 probe = uCamera + rd * mid;
      float clearance;
      if (probe.z - surface(probe.xy, probe.z, mid, clearance) < 0.0) hi = mid;
      else lo = mid;
    }
    t = hi;
    pos = uCamera + rd * t;
    vec2 uv = (pos.xy - uGridOrigin) / uGridSpan;
    vec2 step = uCellSize / uGridSpan;
    float fade = detail(t);
    float a = texture(uField, uv).x * fade;
    vec2 aSlope = vec2(
      texture(uField, uv + vec2(step.x, 0.0)).x - texture(uField, uv - vec2(step.x, 0.0)).x,
      texture(uField, uv + vec2(0.0, step.y)).x - texture(uField, uv - vec2(0.0, step.y)).x
    ) * fade / (2.0 * uCellSize);
    slope = mound(pos.xy).yz + spikesSlope(pos.xy, a, aSlope);
  }

  vec3 n = normalize(vec3(-slope, 1.0));
  vec3 r = reflect(rd, n);
  float soft = length(fwidth(r)) * 0.6;
  float facing = max(dot(n, -rd), 0.0);
  float fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);
  float rim = pow(1.0 - clamp(abs(dot(rd, n)), 0.0, 1.0), 3.0) * smoothstep(0.85, 0.4, n.z);
  float distance = 1.0 - smoothstep(uFogStart, uFar, t);

  if (uLight > 0.5) {
    vec3 key = normalize(vec3(-0.45, -0.55, 0.7));
    float lambert = clamp(dot(n, key) / key.z, 0.0, 1.0);
    float diffuse = mix(0.62, 1.0, lambert);
    float room = mix(0.3, 1.0, smoothstep(-0.25, 0.3, r.z));
    room -= 0.3 * rim;
    float lum = mix(diffuse, room, fresnel);
    lum = 1.0 - (1.0 - lum) * clamp(uExposure / 3.0, 0.0, 1.5);
    vec3 shadow = mix(vec3(0.0), uStrip, 0.45);
    vec3 paper = mix(shadow, vec3(1.0), clamp(lum, 0.0, 1.0));
    outColor = finish(vec3(0.0), paper, distance);
    return;
  }

  vec3 shine = 1.0 - exp(-(studio(r, rd, soft) * fresnel + uFill * rim * 0.35) * uExposure);
  outColor = finish(shine, vec3(1.0), distance);
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const shapeOf = sharpness => {
    const edge = clamp((sharpness - 1) / 4, 0, 1);
    const round = 1 - edge * 0.7;
    const exponent = 1.05 + edge * 1.2;
    const span = Math.sqrt(1 + round * round) - round;
    return { round, exponent, span };
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn('[Ferrofluid] Shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const link = (gl, fragmentSource) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[Ferrofluid] Program link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  class FerrofluidInstance {
    constructor(element, options = {}) {
      this.container = element;
      this.container._ferrofluidInstance = this;

      const ds = element.dataset || {};

      // Parse colors array from dataset if available
      let colors = options.colors;
      if (!colors && ds.colors) {
        colors = ds.colors.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (!colors || !colors.length) {
        colors = ['#ffffff', '#ffffff', '#ffffff'];
      }

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';

      this.settings = {
        colors: colors.slice(0, 3),
        speed: Math.max(0, parseFloat(options.speed ?? ds.speed ?? 0.5)),
        scale: clamp(parseFloat(options.scale ?? ds.scale ?? 1.6), 0.2, 6),
        spikeHeight: Math.max(0, parseFloat(options.spikeHeight ?? ds.spikeHeight ?? 1)),
        sharpness: clamp(parseFloat(options.sharpness ?? ds.sharpness ?? 2.5), 0.6, 6),
        turbulence: Math.max(0, parseFloat(options.turbulence ?? ds.turbulence ?? 1)),
        fluidity: clamp(parseFloat(options.fluidity ?? ds.fluidity ?? 0.5), 0, 1),
        tilt: clamp(parseFloat(options.tilt ?? ds.tilt ?? 48), 10, 70),
        magnetism: Math.max(0, parseFloat(options.magnetism ?? ds.magnetism ?? 1)),
        variation: parseFloat(options.variation ?? ds.variation ?? 0),
        flow: FLOW[options.flowDirection ?? ds.flowDirection] ?? FLOW.down,
        brightness: Math.max(0, parseFloat(options.brightness ?? ds.brightness ?? 1)),
        mouseInteraction: options.mouseInteraction ?? (ds.mouseInteraction !== 'false'),
        mouseStrength: Math.max(0, parseFloat(options.mouseStrength ?? ds.mouseStrength ?? 1)),
        mouseRadius: clamp(parseFloat(options.mouseRadius ?? ds.mouseRadius ?? 0.22), 0.02, 2),
        mouseDampening: Math.max(0, parseFloat(options.mouseDampening ?? ds.mouseDampening ?? 0.15)),
        clickPulse: options.clickPulse ?? (ds.clickPulse !== 'false'),
        intro: options.intro ?? (ds.intro !== 'false'),
        lightMode: options.lightMode ?? (ds.lightMode === 'true' || isLight),
        transparent: options.transparent ?? (ds.transparent !== 'false'),
        color: options.color ?? ds.color ?? '#120f17',
        opacity: clamp(parseFloat(options.opacity ?? ds.opacity ?? 1), 0, 1),
        paused: options.paused ?? (ds.paused === 'true'),
        dpr: options.dpr ? parseFloat(options.dpr) : undefined
      };

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'ferrofluid-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      element.appendChild(this.canvas);

      const gl = this.canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
      });

      if (!gl) {
        console.warn('[Ferrofluid] WebGL 2 not supported by client browser.');
        return;
      }
      this.gl = gl;

      this.floatTargets = Boolean(gl.getExtension('EXT_color_buffer_float'));
      this.sim = link(gl, SIM_FRAGMENT);
      this.bounds = link(gl, BOUND_FRAGMENT);
      this.render = link(gl, RENDER_FRAGMENT);

      if (!this.sim || !this.bounds || !this.render) {
        console.warn('[Ferrofluid] Shader programs failed to initialize.');
        return;
      }

      this.buffer = gl.createBuffer();
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      this.probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      this.cache = new Map();

      this.reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      this.tanHalf = Math.tan(FOV / 2);
      this.view = { width: 1, height: 1, worldHeight: 10, scale: 0, tilt: -1, reach: 1 };
      this.camera = { x: 0, y: 0, z: 1, forward: [0, 1, 0], upward: [0, 0, 1], far: 10, distance: 4 };
      this.grid = { width: 0, height: 0, originX: 0, originY: 0, boundWidth: 0, boundHeight: 0 };
      this.states = [];
      this.boundTarget = null;
      this.current = 0;
      this.settle = true;

      this.pointer = { x: 0, y: 0, inside: false };
      this.cursor = { x: 0, y: 0, strength: 0 };
      this.pulse = { x: 0, y: 0, age: 10 };
      this.wander = 0;
      this.presence = this.settings.intro && !this.reduce ? 0 : 1;
      this.shape = shapeOf(this.settings.sharpness);
      this.shapeKey = this.settings.sharpness;
      this.raf = 0;
      this.last = 0;
      this.visible = true;

      this.frame = this.frame.bind(this);
      this.resize = this.resize.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onPointerLeave = this.onPointerLeave.bind(this);
      this.onVisibility = this.onVisibility.bind(this);
      this.onThemeChange = this.onThemeChange.bind(this);

      this.initEvents();
      this.resize();
    }

    makeTarget(width, height, filter) {
      const gl = this.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (this.floatTargets) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, framebuffer };
    }

    dropTarget(target) {
      if (!target) return;
      const gl = this.gl;
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }

    parse(value, fallback) {
      if (!value) return fallback;
      const key = String(value);
      if (this.cache.has(key)) return this.cache.get(key);
      let rgb = fallback;
      if (this.probe) {
        this.probe.clearRect(0, 0, 1, 1);
        this.probe.fillStyle = '#000000';
        this.probe.fillStyle = key;
        this.probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = this.probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      this.cache.set(key, rgb);
      return rgb;
    }

    castRay(x, y) {
      const aspect = this.view.width / this.view.height;
      const sx = x * aspect * this.tanHalf;
      const sy = y * this.tanHalf;
      const [fx, fy, fz] = this.camera.forward;
      const [, uy, uz] = this.camera.upward;
      const dx = fx + sx;
      const dy = fy + sy * uy;
      const dz = fz + sy * uz;
      const length = Math.hypot(dx, dy, dz) || 1;
      return [dx / length, dy / length, dz / length];
    }

    groundAt(x, y) {
      const [dx, dy, dz] = this.castRay(x, y);
      const t = dz < -0.004 ? Math.min(-this.camera.z / dz, this.camera.far) : this.camera.far;
      return [this.camera.x + dx * t, this.camera.y + dy * t];
    }

    layout() {
      const container = this.container;
      const canvas = this.canvas;
      const gl = this.gl;
      if (!container || !canvas || !gl) return;

      const s = this.settings;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));

      this.view.width = canvas.width;
      this.view.height = canvas.height;
      this.view.worldHeight = 22 / s.scale;
      this.view.scale = s.scale;
      this.view.tilt = s.tilt;

      const pitch = ((90 - s.tilt) * Math.PI) / 180;
      const distance = this.view.worldHeight / (2 * this.tanHalf);
      this.camera.forward = [0, Math.cos(pitch), -Math.sin(pitch)];
      this.camera.upward = [0, Math.sin(pitch), Math.cos(pitch)];
      this.camera.x = 0;
      this.camera.y = -distance * Math.cos(pitch);
      this.camera.z = distance * Math.sin(pitch);
      this.camera.far = distance * 2.5;
      this.camera.distance = distance;

      const corners = [
        this.groundAt(-1, -1),
        this.groundAt(1, -1),
        this.groundAt(-1, 1),
        this.groundAt(1, 1),
        this.groundAt(0, 1)
      ];
      const xs = corners.map(c => c[0]);
      const ys = corners.map(c => c[1]);
      const minX = Math.min(...xs) - 3;
      const maxX = Math.max(...xs) + 3;
      const minY = Math.min(...ys) - 3;
      const maxY = Math.max(...ys) + 3;

      this.view.reach = Math.max(...corners.map(c => Math.hypot(c[0], c[1]))) + 4;
      const gridWidth = Math.ceil((maxX - minX) / CELL) + 2;
      const gridHeight = Math.ceil((maxY - minY) / CELL) + 2;
      this.grid.originX = minX;
      this.grid.originY = minY;

      if (gridWidth !== this.grid.width || gridHeight !== this.grid.height) {
        this.states.forEach(t => this.dropTarget(t));
        this.dropTarget(this.boundTarget);
        this.states = [
          this.makeTarget(gridWidth, gridHeight, gl.LINEAR),
          this.makeTarget(gridWidth, gridHeight, gl.LINEAR)
        ];
        this.grid.width = gridWidth;
        this.grid.height = gridHeight;
        this.grid.boundWidth = Math.ceil((gridWidth * CELL) / BOUND_CELL);
        this.grid.boundHeight = Math.ceil((gridHeight * CELL) / BOUND_CELL);
        this.boundTarget = this.makeTarget(this.grid.boundWidth, this.grid.boundHeight, gl.NEAREST);
        this.current = 0;
      }
      this.settle = true;
    }

    toWorld(clientX, clientY) {
      const rect = this.container.getBoundingClientRect();
      const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const y = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;
      return this.groundAt(x, y);
    }

    step(dt) {
      const s = this.settings;
      if (s.scale !== this.view.scale || s.tilt !== this.view.tilt) this.layout();
      const motion = s.paused ? 0 : 1;
      this.wander += dt * motion * (this.reduce ? 0 : s.speed);
      this.presence = s.intro && !this.reduce ? Math.min(1, this.presence + (dt * motion) / INTRO_SECONDS) : 1;
      this.pulse.age += dt * motion;

      const engaged = s.mouseInteraction && this.pointer.inside;
      const follow = s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;
      if (engaged) {
        this.cursor.x += (this.pointer.x - this.cursor.x) * follow;
        this.cursor.y += (this.pointer.y - this.cursor.y) * follow;
      }
      const targetStrength = engaged ? s.mouseStrength * 1.4 : 0;
      this.cursor.strength += (targetStrength - this.cursor.strength) * (1 - Math.exp(-dt / 0.35));
      if (Math.abs(targetStrength - this.cursor.strength) < 0.001) this.cursor.strength = targetStrength;
    }

    draw(dt) {
      if (!this.boundTarget || this.states.length < 2) return;
      const gl = this.gl;
      const s = this.settings;
      const worldUnit = this.view.worldHeight;
      const radius = s.mouseRadius * worldUnit;
      const fullHeight = 1.2 * s.spikeHeight;

      if (s.sharpness !== this.shapeKey) {
        this.shapeKey = s.sharpness;
        this.shape = shapeOf(s.sharpness);
      }
      const reveal = this.presence * this.presence * (3 - 2 * this.presence);

      gl.bindVertexArray(this.vao);
      gl.activeTexture(gl.TEXTURE0);

      const read = this.states[this.current];
      const write = this.states[1 - this.current];

      // 1. Simulation Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
      gl.viewport(0, 0, this.grid.width, this.grid.height);
      gl.useProgram(this.sim.program);
      const su = this.sim.uniforms;
      gl.bindTexture(gl.TEXTURE_2D, read.texture);
      gl.uniform1i(su.uState, 0);
      gl.uniform2f(su.uGridOrigin, this.grid.originX, this.grid.originY);
      gl.uniform1f(su.uCell, CELL);
      gl.uniform1f(su.uDt, Math.max(dt, 0.001));
      gl.uniform1f(su.uTime, this.wander);
      gl.uniform2f(su.uFlow, s.flow[0], s.flow[1]);
      gl.uniform1f(su.uTurbulence, s.turbulence);
      gl.uniform1f(su.uMagnetism, s.magnetism);
      gl.uniform1f(su.uFieldScale, 5.5);
      gl.uniform2f(su.uSeed, s.variation * 17.31, s.variation * 9.73);
      gl.uniform4f(su.uCursor, this.cursor.x, this.cursor.y, this.cursor.strength, radius);
      gl.uniform4f(su.uPulse, this.pulse.x, this.pulse.y, this.pulse.age, this.pulse.age < 4 ? 1.1 : 0);
      gl.uniform1f(su.uPulseSpeed, worldUnit * 0.45);
      gl.uniform1f(su.uPulseWidth, 1.4);
      gl.uniform3f(su.uIntro, 0, 0, reveal * (this.view.reach + 3));
      gl.uniform1f(su.uSpikeHeight, fullHeight);
      gl.uniform1f(su.uMound, 0.6);
      gl.uniform1f(su.uStiffness, 150);
      gl.uniform1f(su.uDamping, 22 - s.fluidity * 15);
      gl.uniform1f(su.uSettle, this.settle || !this.floatTargets || this.reduce ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.settle = false;
      this.current = 1 - this.current;

      // 2. Bounds Calculation Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.boundTarget.framebuffer);
      gl.viewport(0, 0, this.grid.boundWidth, this.grid.boundHeight);
      gl.useProgram(this.bounds.program);
      const bu = this.bounds.uniforms;
      gl.bindTexture(gl.TEXTURE_2D, write.texture);
      gl.uniform1i(bu.uState, 0);
      gl.uniform2f(bu.uGridOrigin, this.grid.originX, this.grid.originY);
      gl.uniform1f(bu.uCell, CELL);
      gl.uniform2f(bu.uStateSize, this.grid.width, this.grid.height);
      gl.uniform1f(bu.uBoundCell, BOUND_CELL);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 3. Final Render Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.view.width, this.view.height);
      gl.useProgram(this.render.program);
      const ru = this.render.uniforms;
      gl.bindTexture(gl.TEXTURE_2D, write.texture);
      gl.uniform1i(ru.uField, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.boundTarget.texture);
      gl.uniform1i(ru.uBound, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform2f(ru.uGridOrigin, this.grid.originX, this.grid.originY);
      gl.uniform2f(ru.uGridSpan, this.grid.width * CELL, this.grid.height * CELL);
      gl.uniform2f(ru.uBoundSpan, this.grid.boundWidth * BOUND_CELL, this.grid.boundHeight * BOUND_CELL);
      gl.uniform1f(ru.uCellSize, CELL);
      gl.uniform2f(ru.uResolution, this.view.width, this.view.height);
      gl.uniform3f(ru.uCamera, this.camera.x, this.camera.y, this.camera.z);
      gl.uniform3fv(ru.uForward, this.camera.forward);
      gl.uniform3fv(ru.uUpward, this.camera.upward);
      gl.uniform1f(ru.uTanHalf, this.tanHalf);
      gl.uniform1f(ru.uPixelAngle, (2 * this.tanHalf) / this.view.height);
      gl.uniform1f(ru.uFar, this.camera.far);
      gl.uniform1f(ru.uFogStart, this.camera.distance * 0.95);
      gl.uniform1f(ru.uTop, fullHeight * 1.6 + 0.6 * 3 + 0.1);
      gl.uniform1f(ru.uBottom, -0.05);
      gl.uniform1f(ru.uTime, this.wander * 2);
      gl.uniform4f(ru.uCursor, this.cursor.x, this.cursor.y, this.cursor.strength, radius);
      gl.uniform1f(ru.uMound, 0.6);
      gl.uniform1f(ru.uRound, this.shape.round);
      gl.uniform1f(ru.uSpan, this.shape.span);
      gl.uniform1f(ru.uExponent, this.shape.exponent);
      gl.uniform1f(ru.uWarp, 0.06 * s.turbulence);

      const lights = s.colors.map(value => this.parse(value, [1, 1, 1]));
      const key = lights[0];
      const strip = lights[1] ?? key;
      const fill = lights[2] ?? strip;

      gl.uniform3fv(ru.uKey, key);
      gl.uniform3fv(ru.uStrip, strip);
      gl.uniform3fv(ru.uFill, fill);
      gl.uniform1f(ru.uExposure, 3 * s.brightness);
      gl.uniform1f(ru.uLight, s.lightMode ? 1 : 0);
      gl.uniform1f(ru.uOpaque, s.transparent ? 0 : 1);
      gl.uniform3fv(ru.uBase, this.parse(s.color, s.lightMode ? [1, 1, 1] : [0.0706, 0.0588, 0.0902]));
      gl.uniform1f(ru.uOpacity, s.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    frame(now) {
      this.raf = 0;
      if (!this.visible || document.hidden) return;
      const dt = this.last ? clamp((now - this.last) / 1000, 0.0005, 0.05) : 1 / 60;
      this.last = now;
      this.step(dt);
      this.draw(dt);
      this.raf = requestAnimationFrame(this.frame);
    }

    wake() {
      if (!this.raf && this.visible && !document.hidden) {
        this.raf = requestAnimationFrame(this.frame);
      }
    }

    resize() {
      this.layout();
      this.draw(0);
      this.wake();
    }

    locate(event) {
      const rect = this.container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      [this.pointer.x, this.pointer.y] = this.toWorld(event.clientX, event.clientY);
    }

    onPointerMove(event) {
      const wasInside = this.pointer.inside;
      this.locate(event);
      if (this.pointer.inside && !wasInside && this.cursor.strength < 0.05) {
        this.cursor.x = this.pointer.x;
        this.cursor.y = this.pointer.y;
      }
      this.wake();
    }

    onPointerDown(event) {
      this.onPointerMove(event);
      if (!this.pointer.inside || !this.settings.clickPulse || this.reduce) return;
      this.pulse.x = this.pointer.x;
      this.pulse.y = this.pointer.y;
      this.pulse.age = 0;
    }

    onPointerUp(event) {
      if (event.pointerType !== 'mouse') this.pointer.inside = false;
    }

    onPointerLeave() {
      this.pointer.inside = false;
    }

    onVisibility() {
      this.last = 0;
      this.wake();
    }

    onThemeChange() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      this.settings.lightMode = isLight;
      this.cache.clear();
      this.settle = true;
      this.wake();
    }

    initEvents() {
      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(this.container);

      this.intersectionObserver = new IntersectionObserver(entries => {
        this.visible = entries.some(entry => entry.isIntersecting);
        if (this.visible) {
          this.last = 0;
          this.wake();
        }
      });
      this.intersectionObserver.observe(this.container);

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
      window.addEventListener('pointerup', this.onPointerUp, { passive: true });
      window.addEventListener('pointercancel', this.onPointerUp, { passive: true });
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.onVisibility);

      this.themeObserver = new MutationObserver(mutations => {
        for (const m of mutations) {
          if (m.attributeName === 'data-theme') {
            this.onThemeChange();
          }
        }
      });
      this.themeObserver.observe(document.documentElement, { attributes: true });
    }

    destroy() {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      if (this.themeObserver) this.themeObserver.disconnect();

      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerdown', this.onPointerDown);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerUp);
      document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
      document.removeEventListener('visibilitychange', this.onVisibility);

      const gl = this.gl;
      if (gl) {
        this.states.forEach(t => this.dropTarget(t));
        this.dropTarget(this.boundTarget);
        gl.deleteProgram(this.sim.program);
        gl.deleteProgram(this.bounds.program);
        gl.deleteProgram(this.render.program);
        gl.deleteBuffer(this.buffer);
        gl.deleteVertexArray(this.vao);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  function initFerrofluid(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return null;
    return new FerrofluidInstance(container, options);
  }

  function autoInit() {
    const elements = document.querySelectorAll('[data-ferrofluid="true"], .ferrofluid-container');
    elements.forEach(el => {
      if (el._ferrofluidInstance) return;
      el._ferrofluidInstance = new FerrofluidInstance(el);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  global.Ferrofluid = {
    init: initFerrofluid,
    Instance: FerrofluidInstance
  };
})(typeof window !== 'undefined' ? window : this);
