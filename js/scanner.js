/**
 * Scanner Component (Vanilla JavaScript + WebGL 2 implementation)
 * Based on React Bits Scanner component.
 * Features:
 * - GLSL 3.0 ES fragment shader with signal wave field, CRT scanlines, chromatic spread, and animated grain
 * - Interactive pointer focus lighting
 * - IntersectionObserver to pause rendering when offscreen (zero battery/GPU waste)
 * - ResizeObserver with device pixel ratio scaling
 */

(function (global) {
  'use strict';

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [1, 1, 1];
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ];
  };

  const directionToFloat = (dir) => {
    if (dir === 'horizontal') return 1.0;
    if (dir === 'diagonal') return 2.0;
    return 0.0;
  };

  const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU = 6.2831853;

float signalField(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

vec3 palette(float f) {
  f = clamp(f, 0.0, 1.0);
  f = pow(f, uContrast);
  vec3 c = mix(uColor1, uColor2, smoothstep(0.08, 0.6, f));
  return mix(c, uColor3, smoothstep(0.68, 1.0, f));
}

float scanBand(float x, float aa, float sharp) {
  float v = mix(0.5, 0.5 + 0.5 * cos(x * TAU), aa);
  return pow(v, sharp);
}

void main() {
  float aspect = iResolution.x / iResolution.y;
  vec2 uv0 = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv0 / max(uScale, 0.001);

  float t = iTime * uSpeed;

  float mouseBoost = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mUv = vec2((uMouse.x * 2.0 - 1.0) * aspect, uMouse.y * 2.0 - 1.0);
    vec2 md = uv0 - mUv;
    float r = max(uMouseRadius, 0.001);
    mouseBoost = exp(-dot(md, md) / (r * r)) * uMouseStrength * uMouseActive;
  }

  float axis;
  if (uDirection < 0.5) axis = p.y;
  else if (uDirection < 1.5) axis = p.x;
  else axis = (p.x + p.y) * 0.70710678;

  float sig = signalField(p * uFrequency, t);
  float coord = axis + sig * uRipple;

  float phase = coord / max(uSweepWidth, 0.05) - t * uSweepSpeed;
  float sweep = pow(0.5 + 0.5 * cos(phase * TAU), max(uSweepFalloff, 0.1));

  float lc = coord * uBandDensity;
  float aa = 1.0 / (1.0 + uSoftness * fwidth(lc) * 3.0);
  aa = clamp(aa * (1.0 + mouseBoost * 0.6), 0.0, 1.0);

  float bodyBase = clamp(0.5 + 0.5 * sig, 0.0, 1.0);
  float body = bodyBase * bodyBase * uGlow * sweep;

  float sharp = max(uLineSharpness, 0.1);
  float split = uColorSpread * 0.16;
  float fr = clamp(scanBand(lc + split, aa, sharp) * sweep + body, 0.0, 1.0);
  float fg = clamp(scanBand(lc, aa, sharp) * sweep + body, 0.0, 1.0);
  float fb = clamp(scanBand(lc - split, aa, sharp) * sweep + body, 0.0, 1.0);

  vec3 col = vec3(palette(fr).r, palette(fg).g, palette(fb).b);

  float inten = (fr + fg + fb) * 0.3333333 * uBrightness;
  inten *= 1.0 + mouseBoost * 0.9;

  if (uScanline > 0.5) {
    inten *= 1.0 - 0.18 * (0.5 + 0.5 * cos(gl_FragCoord.y * 1.7));
  }

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    inten += (g - 0.5) * uGrainIntensity;
  }

  inten *= clamp(1.0 - uVignette * smoothstep(0.55, 1.65, length(uv0)), 0.0, 1.0);
  inten = clamp(inten, 0.0, 1.0);

  float a = clamp(inten * uOpacity, 0.0, 1.0);
  fragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      console.error('Shader compile error:', info);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      console.error('Program link error:', info);
      return null;
    }
    return program;
  }

  const defaultProps = {
    color1: '#5227FF',
    color2: '#FF9FFC',
    color3: '#FFFFFF',
    speed: 0.5,
    sweepSpeed: 0.25,
    sweepWidth: 1.6,
    sweepFalloff: 6,
    scale: 1.5,
    frequency: 2,
    ripple: 0.22,
    bandDensity: 11,
    lineSharpness: 5.5,
    glow: 0.22,
    scanDirection: 'vertical',
    colorSpread: 0.7,
    brightness: 1.0,
    contrast: 1.15,
    softness: 1.4,
    vignette: 0.45,
    scanline: true,
    grain: true,
    grainIntensity: 0.05,
    opacity: 1.0,
    mouseInteraction: true,
    mouseRadius: 0.5,
    mouseStrength: 0.5
  };

  class ScannerInstance {
    constructor(container, options = {}) {
      this.container = container;
      this.props = Object.assign({}, defaultProps, options);
      this.raf = 0;
      this.isVisible = true;
      this.isPageVisible = !document.hidden;
      this.currentMouse = [0.5, 0.5];
      this.targetMouse = [0.5, 0.5];
      this.mouseActive = 0;
      this.targetMouseActive = 0;
      this.t0 = performance.now();

      this.init();
    }

    init() {
      const container = this.container;
      if (!container) return;

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      container.appendChild(canvas);
      this.canvas = canvas;

      const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        powerPreference: 'high-performance'
      });

      if (!gl) {
        console.warn('WebGL 2 is not supported by your browser for Scanner.');
        return;
      }
      this.gl = gl;

      gl.clearColor(0, 0, 0, 0);

      const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
      if (!program) return;
      this.program = program;

      // Fullscreen Triangle [-1, -1], [3, -1], [-1, 3]
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const posLoc = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      this.vao = vao;

      // Cache uniform locations
      const uniformNames = [
        'iTime', 'iResolution', 'uSpeed', 'uSweepSpeed', 'uSweepWidth', 'uSweepFalloff',
        'uScale', 'uFrequency', 'uRipple', 'uBandDensity', 'uLineSharpness', 'uGlow',
        'uColorSpread', 'uBrightness', 'uContrast', 'uSoftness', 'uVignette', 'uOpacity',
        'uScanline', 'uGrain', 'uGrainIntensity', 'uDirection', 'uMouse', 'uMouseEnabled',
        'uMouseRadius', 'uMouseStrength', 'uMouseActive', 'uColor1', 'uColor2', 'uColor3'
      ];
      this.uniforms = {};
      uniformNames.forEach((name) => {
        this.uniforms[name] = gl.getUniformLocation(program, name);
      });

      this.updateStaticUniforms();

      // Resize handling
      this.handleResize = () => {
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));

        const drawingW = Math.floor(w * dpr);
        const drawingH = Math.floor(h * dpr);

        if (canvas.width !== drawingW || canvas.height !== drawingH) {
          canvas.width = drawingW;
          canvas.height = drawingH;
        }

        gl.viewport(0, 0, drawingW, drawingH);
        gl.useProgram(program);
        gl.uniform2f(this.uniforms.iResolution, drawingW, drawingH);
        this.renderFrame(performance.now());
      };

      this.ro = new ResizeObserver(() => this.handleResize());
      this.ro.observe(container);
      this.handleResize();

      // Mouse tracking on container and parent section for responsiveness
      const mouseTarget = container.closest('section') || container;

      this.onMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          this.targetMouse = [
            (e.clientX - rect.left) / rect.width,
            1.0 - (e.clientY - rect.top) / rect.height
          ];
          this.targetMouseActive = 1;
        } else {
          this.targetMouseActive = 0;
        }
      };

      this.onMouseLeave = () => {
        this.targetMouseActive = 0;
      };

      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      document.addEventListener('mouseleave', this.onMouseLeave);

      // Visibility & Intersection Observers
      this.io = new IntersectionObserver(
        ([entry]) => {
          this.isVisible = entry.isIntersecting;
          this.isVisible ? this.start() : this.stop();
        },
        { threshold: 0 }
      );
      this.io.observe(container);

      this.onVisibility = () => {
        this.isPageVisible = !document.hidden;
        this.isPageVisible ? this.start() : this.stop();
      };
      document.addEventListener('visibilitychange', this.onVisibility);

      this.start();
    }

    updateStaticUniforms() {
      const gl = this.gl;
      const u = this.uniforms;
      const p = this.props;
      if (!gl || !this.program) return;

      gl.useProgram(this.program);
      gl.uniform1f(u.uSpeed, p.speed);
      gl.uniform1f(u.uSweepSpeed, p.sweepSpeed);
      gl.uniform1f(u.uSweepWidth, p.sweepWidth);
      gl.uniform1f(u.uSweepFalloff, p.sweepFalloff);
      gl.uniform1f(u.uScale, p.scale);
      gl.uniform1f(u.uFrequency, p.frequency);
      gl.uniform1f(u.uRipple, p.ripple);
      gl.uniform1f(u.uBandDensity, p.bandDensity);
      gl.uniform1f(u.uLineSharpness, p.lineSharpness);
      gl.uniform1f(u.uGlow, p.glow);
      gl.uniform1f(u.uColorSpread, p.colorSpread);
      gl.uniform1f(u.uBrightness, p.brightness);
      gl.uniform1f(u.uContrast, p.contrast);
      gl.uniform1f(u.uSoftness, p.softness);
      gl.uniform1f(u.uVignette, p.vignette);
      gl.uniform1f(u.uOpacity, p.opacity);
      gl.uniform1f(u.uScanline, p.scanline ? 1.0 : 0.0);
      gl.uniform1f(u.uGrain, p.grain ? 1.0 : 0.0);
      gl.uniform1f(u.uGrainIntensity, p.grainIntensity);
      gl.uniform1f(u.uDirection, directionToFloat(p.scanDirection));
      gl.uniform1f(u.uMouseEnabled, p.mouseInteraction ? 1.0 : 0.0);
      gl.uniform1f(u.uMouseRadius, p.mouseRadius);
      gl.uniform1f(u.uMouseStrength, p.mouseStrength);

      const c1 = hexToRgb(p.color1);
      const c2 = hexToRgb(p.color2);
      const c3 = hexToRgb(p.color3);
      gl.uniform3f(u.uColor1, c1[0], c1[1], c1[2]);
      gl.uniform3f(u.uColor2, c2[0], c2[1], c2[2]);
      gl.uniform3f(u.uColor3, c3[0], c3[1], c3[2]);
    }

    setProps(newProps) {
      Object.assign(this.props, newProps);
      this.updateStaticUniforms();
    }

    renderFrame(t) {
      const gl = this.gl;
      if (!gl || !this.program) return;

      gl.useProgram(this.program);
      gl.uniform1f(this.uniforms.iTime, (t - this.t0) * 0.001);

      if (!this.props.mouseInteraction) {
        this.targetMouseActive = 0;
      }

      this.currentMouse[0] += 0.05 * (this.targetMouse[0] - this.currentMouse[0]);
      this.currentMouse[1] += 0.05 * (this.targetMouse[1] - this.currentMouse[1]);
      gl.uniform2f(this.uniforms.uMouse, this.currentMouse[0], this.currentMouse[1]);

      this.mouseActive += 0.05 * (this.targetMouseActive - this.mouseActive);
      gl.uniform1f(this.uniforms.uMouseActive, this.mouseActive);

      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    loop(t) {
      this.renderFrame(t);
      this.raf = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    start() {
      if (this.isVisible && this.isPageVisible && this.raf === 0) {
        this.raf = requestAnimationFrame((timestamp) => this.loop(timestamp));
      }
    }

    stop() {
      if (this.raf !== 0) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    }

    destroy() {
      this.stop();
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibility);
      window.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseleave', this.onMouseLeave);
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      if (this.gl) {
        this.gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    }
  }

  function initScanner(container, options) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return null;
    return new ScannerInstance(container, options);
  }

  global.Scanner = {
    init: initScanner,
    Instance: ScannerInstance
  };
})(typeof window !== 'undefined' ? window : this);
