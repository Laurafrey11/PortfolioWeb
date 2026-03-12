// ===========================
// WEBGL SHADER BACKGROUND
// ===========================
(function initShader() {
  const canvas = document.getElementById('shaderCanvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const vs = `attribute vec4 aPos; void main(){gl_Position=aPos;}`;
  const fs = `
    precision highp float;
    uniform vec2 iRes;
    uniform float iTime;
    const float speed=0.2,gridSmooth=0.015,axisW=0.05,majW=0.025,minW=0.0125,majFreq=5.0,minFreq=1.0,scale=5.0;
    const float minLW=0.01,maxLW=0.2,lSpeed=1.0*speed,lAmp=1.0,lFreq=0.2,wSpeed=0.2*speed,wFreq=0.5,wAmp=1.0;
    const float offFreq=0.5,offSpeed=1.33*speed,minOff=0.6,maxOff=2.0;
    const int linesPerGroup=16;
    const vec4 lineColor=vec4(0.4,0.2,0.9,1.0);
    float rnd(float t){return(cos(t)+cos(t*1.3+1.3)+cos(t*1.4+1.4))/3.0;}
    float drawCrispLine(float pos,float hw,float t){return smoothstep(hw+gridSmooth,hw,abs(pos-t));}
    float drawSmoothLine(float pos,float hw,float t){return smoothstep(hw,0.0,abs(pos-t));}
    float drawCircle(vec2 pos,float r,vec2 coord){return smoothstep(r+gridSmooth,r,length(coord-pos));}
    float drawPeriodicLine(float freq,float w,float t){return drawCrispLine(freq/2.0,w,abs(mod(t,freq)-freq/2.0));}
    float drawGrid(float ax){return min(1.0,drawCrispLine(0.0,axisW,ax)+drawPeriodicLine(majFreq,majW,ax)+drawPeriodicLine(minFreq,minW,ax));}
    float plasmaY(float x,float hFade,float offset){return rnd(x*lFreq+iTime*lSpeed)*hFade*lAmp+offset;}
    void main(){
      vec2 uv=gl_FragCoord.xy/iRes.xy;
      vec2 space=(gl_FragCoord.xy-iRes.xy/2.0)/iRes.x*2.0*scale;
      float hFade=1.0-(cos(uv.x*6.28)*0.5+0.5);
      float vFade=1.0-(cos(uv.y*6.28)*0.5+0.5);
      space.y+=rnd(space.x*wFreq+iTime*wSpeed)*wAmp*(0.5+hFade);
      space.x+=rnd(space.y*wFreq+iTime*wSpeed+2.0)*wAmp*hFade;
      vec4 lines=vec4(0.0);
      for(int l=0;l<linesPerGroup;l++){
        float ni=float(l)/float(linesPerGroup);
        float ot=iTime*offSpeed;
        float op=float(l)+space.x*offFreq;
        float r=rnd(op+ot)*0.5+0.5;
        float hw=mix(minLW,maxLW,r*hFade)/2.0;
        float offset=rnd(op+ot*(1.0+ni))*mix(minOff,maxOff,hFade);
        float lp=plasmaY(space.x,hFade,offset);
        float line=drawSmoothLine(lp,hw,space.y)/2.0+drawCrispLine(lp,hw*0.15,space.y);
        float cx=mod(float(l)+iTime*lSpeed,25.0)-12.0;
        float circle=drawCircle(vec2(cx,plasmaY(cx,hFade,offset)),0.01,space)*4.0;
        lines+=(line+circle)*lineColor*r;
      }
      vec4 bg=mix(vec4(0.05,0.05,0.18,1.0),vec4(0.12,0.04,0.22,1.0),uv.x)*vFade;
      gl_FragColor=bg+lines;
    }
  `;
  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'aPos');
  const resLoc = gl.getUniformLocation(prog, 'iRes');
  const timeLoc = gl.getUniformLocation(prog, 'iTime');
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();
  const t0 = Date.now();
  function render() {
    gl.useProgram(prog);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(timeLoc, (Date.now() - t0) / 1000);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();
})();

// ===========================
// GLOW CARD EFFECT
// ===========================
function initGlowCards() {
  const cards = document.querySelectorAll('[data-glow]');
  document.addEventListener('pointermove', (e) => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const proximity = 80;
      const inactiveRadius = Math.min(rect.width, rect.height) * 0.3;
      const distFromCenter = Math.hypot(e.clientX - cx, e.clientY - cy);
      const isNear = e.clientX > rect.left - proximity &&
                     e.clientX < rect.right + proximity &&
                     e.clientY > rect.top - proximity &&
                     e.clientY < rect.bottom + proximity;
      if (isNear && distFromCenter > inactiveRadius) {
        card.style.setProperty('--active', '1');
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
        card.style.setProperty('--start', String(angle));
      } else {
        card.style.setProperty('--active', '0');
      }
    });
  });
}
initGlowCards();

// ===========================
// DARK / LIGHT MODE
// ===========================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') html.classList.add('light');

themeToggle.addEventListener('click', () => {
  html.classList.toggle('light');
  localStorage.setItem('theme', html.classList.contains('light') ? 'light' : 'dark');
});

// ===========================
// LANGUAGE TOGGLE
// ===========================
let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.documentElement.lang = lang;

  // Update all translatable elements
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'es' ? el.dataset.es : el.dataset.en;
  });

  // Update active state on toggle buttons
  document.getElementById('langEN').classList.toggle('active', lang === 'en');
  document.getElementById('langES').classList.toggle('active', lang === 'es');
}

document.getElementById('langEN').addEventListener('click', () => applyLang('en'));
document.getElementById('langES').addEventListener('click', () => applyLang('es'));

// Apply on load
applyLang(currentLang);

// ===========================
// NAVBAR SCROLL
// ===========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===========================
// MOBILE MENU
// ===========================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===========================
// REVEAL ON SCROLL
// ===========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===========================
// STAGGER CHILDREN
// ===========================
document.querySelectorAll('.services-grid, .projects-grid, .apps-grid, .stack-grid, .certs-grid, .exp-grid, .contact-links').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.08}s`;
  });
});
