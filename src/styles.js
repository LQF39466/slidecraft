"use strict";

// ─── Theme palettes ──────────────────────────────────────────────────────────

const PALETTES = {
  dark: {
    bg:            '#0d1117',
    bgDeep:        '#060910',
    surface:       '#161b22',
    text:          '#e6edf3',
    textSec:       '#b1bac4',
    textMuted:     '#6e7681',
    a1:            '#60a5fa',
    a2:            '#a78bfa',
    a3:            '#34d399',
    a4:            '#fb923c',
    a5:            '#f87171',
    a1Rgb:         '96,165,250',
    a2Rgb:         '167,139,250',
    a3Rgb:         '52,211,153',
    a4Rgb:         '251,146,60',
    a5Rgb:         '248,113,113',
    glassBg:       'rgba(255,255,255,0.05)',
    glassBorder:   'rgba(255,255,255,0.09)',
    vignette:      'rgba(0,0,0,0.42)',
    navBg:         'rgba(255,255,255,.05)',
    navBorder:     'rgba(255,255,255,.1)',
    btnBg:         'rgba(255,255,255,.05)',
    dotBg:         'rgba(255,255,255,.12)',
    cardBg:        'rgba(255,255,255,.05)',
    cardBorder:    'rgba(255,255,255,.09)',
    cardShadow:    'rgba(96,165,250,.08)',
    iconBg:        'rgba(255,255,255,.06)',
    iconBorder:    'rgba(255,255,255,.1)',
    formulaBg:     'rgba(96,165,250,.07)',
    formulaBorder: 'rgba(96,165,250,.18)',
    formulaText:   '#93c5fd',
    spotlight:     'rgba(96,165,250,0.055)',
    noiseOp:       '.03',
    bBgAlpha:      '.15',
    bBorderAlpha:  '.3',
    tableRule:        'rgba(230,237,243,0.45)',
    tableRuleMid:     'rgba(230,237,243,0.22)',
    tableHover:       'rgba(255,255,255,0.025)',
    tableRowHl:       'rgba(96,165,250,0.10)',
    tableHeatAlpha:   [0.07, 0.38],
  },
  light: {
    bg:            '#f8fafc',
    bgDeep:        '#f1f5f9',
    surface:       '#ffffff',
    text:          '#0f172a',
    textSec:       '#475569',
    textMuted:     '#94a3b8',
    a1:            '#2563eb',
    a2:            '#7c3aed',
    a3:            '#059669',
    a4:            '#ea580c',
    a5:            '#dc2626',
    a1Rgb:         '37,99,235',
    a2Rgb:         '124,58,237',
    a3Rgb:         '5,150,105',
    a4Rgb:         '234,88,12',
    a5Rgb:         '220,38,38',
    glassBg:       'rgba(255,255,255,0.75)',
    glassBorder:   'rgba(15,23,42,0.08)',
    vignette:      'rgba(0,0,0,0.05)',
    navBg:         'rgba(255,255,255,.85)',
    navBorder:     'rgba(15,23,42,.1)',
    btnBg:         'rgba(15,23,42,.04)',
    dotBg:         'rgba(15,23,42,.12)',
    cardBg:        'rgba(255,255,255,.9)',
    cardBorder:    'rgba(15,23,42,.08)',
    cardShadow:    'rgba(15,23,42,.1)',
    iconBg:        'rgba(15,23,42,.04)',
    iconBorder:    'rgba(15,23,42,.08)',
    formulaBg:     'rgba(37,99,235,.05)',
    formulaBorder: 'rgba(37,99,235,.15)',
    formulaText:   '#1d4ed8',
    spotlight:     'rgba(37,99,235,0.04)',
    noiseOp:       '.015',
    bBgAlpha:      '.08',
    bBorderAlpha:  '.25',
    tableRule:        'rgba(15,23,42,0.42)',
    tableRuleMid:     'rgba(15,23,42,0.20)',
    tableHover:       'rgba(15,23,42,0.025)',
    tableRowHl:       'rgba(37,99,235,0.08)',
    tableHeatAlpha:   [0.06, 0.30],
  },
  formal: {
    bg:            '#ffffff',
    bgDeep:        '#f3f4f6',
    surface:       '#f9fafb',
    text:          '#111827',
    textSec:       '#374151',
    textMuted:     '#6b7280',
    a1:            '#1d4ed8',
    a2:            '#6d28d9',
    a3:            '#065f46',
    a4:            '#b45309',
    a5:            '#b91c1c',
    a1Rgb:         '29,78,216',
    a2Rgb:         '109,40,217',
    a3Rgb:         '6,95,70',
    a4Rgb:         '180,83,9',
    a5Rgb:         '185,28,28',
    glassBg:       'rgba(29,78,216,0.05)',
    glassBorder:   'rgba(17,24,39,0.12)',
    vignette:      'rgba(0,0,0,0.02)',
    navBg:         'rgba(255,255,255,.97)',
    navBorder:     'rgba(17,24,39,.15)',
    btnBg:         'rgba(29,78,216,.07)',
    dotBg:         'rgba(17,24,39,.15)',
    cardBg:        '#ffffff',
    cardBorder:    'rgba(17,24,39,.14)',
    cardShadow:    'rgba(17,24,39,.06)',
    iconBg:        'rgba(29,78,216,.06)',
    iconBorder:    'rgba(29,78,216,.18)',
    formulaBg:     'rgba(29,78,216,.04)',
    formulaBorder: 'rgba(29,78,216,.16)',
    formulaText:   '#1e3a8a',
    spotlight:     'rgba(29,78,216,0.025)',
    noiseOp:       '0',
    bBgAlpha:      '.07',
    bBorderAlpha:  '.22',
    tableRule:        'rgba(17,24,39,0.80)',
    tableRuleMid:     'rgba(17,24,39,0.42)',
    tableHover:       'rgba(17,24,39,0.02)',
    tableRowHl:       'rgba(29,78,216,0.06)',
    tableHeatAlpha:   [0.05, 0.22],
    extraCss: `
  /* ── 隐藏图标 ──────────────────────────── */
  .icon-circle{display:none!important}
  .title-icon{display:none!important}
  .icon-card-icon{display:none!important}
  /* ── 字号层级 ──────────────────────────── */
  .text-heading{font-size:.92rem!important}
  .body{font-size:.8rem}
  .small{font-size:.73rem}
  /* ── 去除彩色标签 ─────────────────────── */
  .section-label{color:var(--color-text-muted)!important;letter-spacing:.16em}
  /* ── 统一 8px 圆角 ────────────────────── */
  .card{border-radius:8px;box-shadow:0 1px 4px rgba(17,24,39,.07)}
  .formula{border-radius:8px}
  .badge{border-radius:4px}
  .nav-controls{border-radius:8px;box-shadow:0 2px 12px rgba(17,24,39,.1)}
  /* ── Callout 改为左边框引用样式 ─────── */
  .callout{background:rgba(29,78,216,.04);border:none;border-left:3px solid rgba(29,78,216,.5);border-radius:0 4px 4px 0;padding:.8rem 1rem .8rem 1.1rem;gap:.65rem;align-items:center}
  .callout-icon{color:rgba(29,78,216,.7)}
  .callout-text{color:var(--color-text-secondary)}
`,
  },
};

// ─── Builders ─────────────────────────────────────────────────────────────────

function buildTailwindTheme(p) {
  return `@theme {
  --color-bg: ${p.bg};
  --color-bg-deep: ${p.bgDeep};
  --color-surface: ${p.surface};
  --color-text: ${p.text};
  --color-text-secondary: ${p.textSec};
  --color-text-muted: ${p.textMuted};
  --color-accent-1: ${p.a1};
  --color-accent-2: ${p.a2};
  --color-accent-3: ${p.a3};
  --color-accent-4: ${p.a4};
  --color-glass-bg: ${p.glassBg};
  --color-glass-border: ${p.glassBorder};
  --color-vignette: ${p.vignette};
  --font-display: 'Instrument Serif', serif;
  --font-body: 'Inter', sans-serif;
}`;
}

function buildCustomCss(p) {
  return `
  :root { --color-bg:${p.bg}; --color-text:${p.text}; --glow-color-rgb:${p.a1Rgb}; }
  *,*::before,*::after{box-sizing:border-box}
  html,body{background:var(--color-bg);margin:0}
  body{font-family:'Inter',sans-serif;color:var(--color-text);overflow:hidden;height:100vh;width:100vw}
  .deck{width:100vw;height:100vh;position:relative}
  .slide{position:absolute;inset:0;background:var(--color-bg);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.95);transition:opacity .7s ease,transform .7s ease;pointer-events:none;overflow:hidden}
  .slide.active{opacity:1;transform:scale(1);pointer-events:all}
  .slide>.content{position:relative;z-index:2;width:100%;max-width:1180px;padding:clamp(1.3rem,3vw,3rem)}
  .nav-controls{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;z-index:100;background:${p.navBg};backdrop-filter:blur(12px);padding:9px 20px;border-radius:40px;border:1px solid ${p.navBorder};transition:opacity 0.3s ease, visibility 0.3s ease}
  .nav-controls.hidden{opacity:0;visibility:hidden;pointer-events:none}
  .nav-controls:hover{opacity:1;visibility:visible}
  .nav-btn{width:36px;height:36px;border:none;background:${p.btnBg};color:${p.a1};border-radius:50%;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .slide-dots{display:flex;gap:6px}.slide-dots .dot{width:8px;height:8px;border-radius:50%;background:${p.dotBg};cursor:pointer}.slide-dots .dot.active{background:${p.a1};transform:scale(1.25)}
  .slide-counter{font-size:.75rem;color:${p.textMuted};min-width:42px;text-align:center}
  .reveal{opacity:0;transform:translateY(20px)}
  .gradient-mesh{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
  .blob{position:absolute;border-radius:50%;filter:blur(80px);animation:float-slow 12s ease-in-out infinite}
  .blob:nth-child(2){animation:float-drift 16s ease-in-out infinite}
  .blob:nth-child(3){animation:float-slow 20s ease-in-out infinite reverse}
  .slide::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");background-size:256px 256px;opacity:${p.noiseOp};mix-blend-mode:overlay}
  .slide::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at center,transparent 52%,var(--color-vignette) 100%)}
  @keyframes float-slow{0%{transform:translate(0,0) scale(1)}25%{transform:translate(60px,-50px) scale(1.12)}50%{transform:translate(-40px,40px) scale(.9)}75%{transform:translate(50px,20px) scale(1.08)}100%{transform:translate(0,0) scale(1)}}
  @keyframes float-drift{0%{transform:translate(0,0) scale(1) rotate(0deg)}33%{transform:translate(-50px,-60px) scale(1.15) rotate(3deg)}66%{transform:translate(40px,30px) scale(.88) rotate(-2deg)}100%{transform:translate(0,0) scale(1) rotate(0deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  .badge{display:inline-block;font-size:.63rem;font-weight:700;letter-spacing:.06em;padding:3px 9px;border-radius:18px;text-transform:uppercase}
  .b1{background:rgba(${p.a1Rgb},${p.bBgAlpha});color:${p.a1};border:1px solid rgba(${p.a1Rgb},${p.bBorderAlpha})}
  .b2{background:rgba(${p.a2Rgb},${p.bBgAlpha});color:${p.a2};border:1px solid rgba(${p.a2Rgb},${p.bBorderAlpha})}
  .b3{background:rgba(${p.a3Rgb},${p.bBgAlpha});color:${p.a3};border:1px solid rgba(${p.a3Rgb},${p.bBorderAlpha})}
  .b4{background:rgba(${p.a4Rgb},${p.bBgAlpha});color:${p.a4};border:1px solid rgba(${p.a4Rgb},${p.bBorderAlpha})}
  .b5{background:rgba(${p.a5Rgb},${p.bBgAlpha});color:${p.a5};border:1px solid rgba(${p.a5Rgb},${p.bBorderAlpha})}
  .card{background:${p.cardBg};border:1px solid ${p.cardBorder};border-radius:14px;padding:.95rem 1.1rem;transition:.25s;display:flex;flex-direction:column;justify-content:center}
  .card:hover{transform:translateY(-2px);box-shadow:0 10px 30px ${p.cardShadow}}
  .card-blue{border-left:3px solid ${p.a1}}.card-purple{border-left:3px solid ${p.a2}}.card-green{border-left:3px solid ${p.a3}}.card-orange{border-left:3px solid ${p.a4}}.card-red{border-left:3px solid ${p.a5}}
  .small{font-size:.68rem;color:${p.textMuted};line-height:1.55}
  .body{font-size:.75rem;color:${p.textSec};line-height:1.65}
  .title{font-family:'Instrument Serif',serif;font-size:clamp(1.45rem,3vw,2.15rem);font-weight:600;line-height:1.2;margin:0}
  .section-label{font-size:.64rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:${p.textMuted};margin-bottom:.35rem}
  .formula{font-family:'JetBrains Mono',monospace;background:${p.formulaBg};border:1px solid ${p.formulaBorder};border-radius:10px;padding:.55rem .9rem;font-size:.73rem;color:${p.formulaText};line-height:1.65}
  .story-arrow{font-size:1.2rem;color:${p.textMuted};text-align:center;display:flex;align-items:center;justify-content:center}
  .memory-bar{height:16px;border-radius:8px;background:linear-gradient(90deg,${p.a5},${p.a4},${p.a2},${p.a1},${p.a3})}
  .icon-circle{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${p.iconBg};border:1px solid ${p.iconBorder};font-size:1.1rem;flex-shrink:0}
  .compare-col{display:flex;flex-direction:column;gap:.5rem}
  .divider{height:1px;background:var(--color-glass-border);margin:.6rem 0}
  .callout{display:flex;align-items:center;gap:.7rem;background:linear-gradient(135deg,rgba(${p.a1Rgb},0.08),rgba(${p.a1Rgb},0.03));border-radius:10px;padding:.8rem 1rem;border:1px solid rgba(${p.a1Rgb},0.2);border-left:3px solid ${p.a1}}
  .callout-icon{font-size:1.1rem;line-height:1;flex-shrink:0}
  .callout-body{flex:1;min-width:0}
  .callout-text{font-size:.8rem;font-weight:500;color:var(--color-text);line-height:1.6;margin:0}
  .mouse-spotlight{position:fixed;inset:0;z-index:99;pointer-events:none}
  /* ── Academic Three-line Table (sc-table) ──────────────── */
  .sc-table{width:100%;overflow-x:auto;margin:.3rem 0}
  .sc-table table{width:100%;border-collapse:collapse;font-size:.72rem;line-height:1.45}
  .sc-table caption{display:block;font-size:.67rem;color:var(--color-text-muted);padding:.25rem 0 .45rem;text-align:left}
  .sc-table caption.cap-bottom{padding:.45rem 0 .25rem}
  .sc-table thead th{font-weight:700;color:var(--color-text);padding:.4rem .65rem;white-space:nowrap;border-top:2px solid ${p.tableRule};border-bottom:1.5px solid ${p.tableRuleMid};text-align:center}
  .sc-table thead th:first-child{text-align:left}
  .sc-table tbody td{padding:.33rem .65rem;color:var(--color-text-secondary);border:none;transition:background .15s}
  .sc-table tbody td:first-child{color:var(--color-text)}
  .sc-table tbody tr:last-child td{border-bottom:2px solid ${p.tableRule}}
  .sc-table tbody tr:hover:not(.sc-row-hl) td{background:${p.tableHover}}
  .sc-table .sc-row-hl td{font-weight:700;color:var(--color-text)!important;background:${p.tableRowHl}}
  .sc-table .sc-cell-bold{font-weight:700;color:var(--color-text)!important}
  .sc-table .sc-cell-ul{text-decoration:underline dotted;text-underline-offset:2px}
  .sc-table .sc-cell-accent{color:var(--color-accent-1)!important;font-weight:700}
${p.extraCss || ''}`;
}

// Base runtime JS with placeholder tokens for theme-specific colors.
// SPOTLIGHT_COLOR and ACCENT_RGB are replaced at build time.
const BASE_RUNTIME_JS = `
let current=1;
const total=document.querySelectorAll('.slide').length;
const dotsContainer=document.getElementById('dots');
const counter=document.getElementById('counter');
for(let i=1;i<=total;i++){const dot=document.createElement('div');dot.className='dot'+(i===1?' active':'');dot.onclick=()=>goToSlide(i);dotsContainer.appendChild(dot)}
function goToSlide(n){const prev=document.querySelector('.slide.active');const next=document.querySelector('.slide[data-slide="'+n+'"]');if(prev)prev.classList.remove('active');if(next){next.classList.add('active');animateSlide(next)}current=n;updateNav()}
function changeSlide(dir){let next=current+dir;if(next<1)next=total;if(next>total)next=1;goToSlide(next)}
function updateNav(){document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i+1===current));counter.textContent=current+' / '+total}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();changeSlide(1)}if(e.key==='ArrowLeft'){e.preventDefault();changeSlide(-1)}})
let touchStartX=0;
document.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX});
document.addEventListener('touchend',e=>{const diff=touchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>50)changeSlide(diff>0?1:-1)})
function animateSlide(slide){slide.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transition='none';el.style.opacity='0';el.style.transform='translateY(20px)';el.offsetHeight;const delay=i*0.07;el.style.transition='opacity 0.35s ease '+delay+'s, transform 0.35s ease '+delay+'s';el.style.opacity='1';el.style.transform='translateY(0px)'})}
document.addEventListener('mousemove',e=>{const s=document.querySelector('.mouse-spotlight');if(s){s.style.background='radial-gradient(600px circle at '+e.clientX+'px '+e.clientY+'px, SPOTLIGHT_COLOR, transparent 40%)'}})
window.initParticles=function(canvas,options){if(!canvas)return;const ctx=canvas.getContext('2d');const par=canvas.parentElement;canvas.width=par?par.clientWidth:window.innerWidth;canvas.height=par?par.clientHeight:window.innerHeight;const interactive=options.interactive!==false;const count=options.count||(interactive?55:18);let mx=-1000,my=-1000;const particles=Array.from({length:count},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*0.3,vy:(Math.random()-.5)*0.3,size:Math.random()*2.5+.8,alpha:Math.random()*.28+.07}));if(interactive){canvas.addEventListener('mousemove',e=>{const rect=canvas.getBoundingClientRect();mx=e.clientX-rect.left;my=e.clientY-rect.top});canvas.addEventListener('mouseleave',()=>{mx=-1000;my=-1000})}(function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{if(interactive){const dx=p.x-mx,dy=p.y-my,dist=Math.sqrt(dx*dx+dy*dy);if(dist<120){const force=(120-dist)/120*2;p.vx+=(dx/dist)*force*0.1;p.vy+=(dy/dist)*force*0.1}}p.vx*=0.98;p.vy*=0.98;p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle='rgba(ACCENT_RGB,'+p.alpha+')';ctx.fill()});requestAnimationFrame(animate)})()}
document.querySelectorAll('.particle-canvas').forEach(c=>window.initParticles(c,{interactive:true,count:55}));
document.querySelectorAll('.particle-canvas-ambient').forEach(c=>window.initParticles(c,{interactive:false,count:18}));
try{animateSlide(document.querySelector('.slide.active'))}catch(e){}

// Navigation auto-hide functionality
(function() {
    const navControls = document.querySelector('.nav-controls');
    if (!navControls) return;

    let hideTimer = null;
    const HIDE_DELAY = 3000; // 3 seconds
    const BOTTOM_THRESHOLD = 100; // pixels from bottom to trigger show

    function hideNavControls() {
        navControls.classList.add('hidden');
    }

    function showNavControls() {
        navControls.classList.remove('hidden');
        resetHideTimer();
    }

    function resetHideTimer() {
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
        hideTimer = setTimeout(hideNavControls, HIDE_DELAY);
    }

    // Mouse move listener to detect when near bottom
    document.addEventListener('mousemove', function(e) {
        const windowHeight = window.innerHeight;
        const mouseY = e.clientY;

        if (mouseY > windowHeight - BOTTOM_THRESHOLD) {
            // Mouse is near bottom, show nav controls
            showNavControls();
        }
    });

    // Also show when mouse enters nav controls
    navControls.addEventListener('mouseenter', function() {
        showNavControls();
    });

    // Initialize: start hide timer
    resetHideTimer();

    // Reset timer on any user interaction
    document.addEventListener('keydown', resetHideTimer);
    document.addEventListener('click', resetHideTimer);
    document.addEventListener('touchstart', resetHideTimer);
})();
`.trim();

function buildRuntimeJs(p) {
  return BASE_RUNTIME_JS
    .replace('SPOTLIGHT_COLOR', p.spotlight)
    .replace('ACCENT_RGB', p.a1Rgb);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return the full set of style strings for the given theme.
 * @param {'dark'|'light'} theme
 * @returns {{ TAILWIND_THEME: string, CUSTOM_CSS: string, RUNTIME_JS: string }}
 */
function getStyles(theme) {
  const p = PALETTES[theme] || PALETTES.dark;
  return {
    TAILWIND_THEME: buildTailwindTheme(p),
    CUSTOM_CSS: buildCustomCss(p),
    RUNTIME_JS: buildRuntimeJs(p),
    palette: p,
  };
}

// Backward-compatible dark-theme exports
const { TAILWIND_THEME, CUSTOM_CSS, RUNTIME_JS } = getStyles('dark');

module.exports = { getStyles, TAILWIND_THEME, CUSTOM_CSS, RUNTIME_JS };
