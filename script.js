// Mobile menu
(function () {
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') nav.classList.remove('open');
  });
})();

// Cycling reveal animations: 6 styles, a different style plays on every viewport entry.
// Manual viewport check (rAF-throttled): deterministic, never strands elements
// invisible after back/forward navigation the way an observer can.
var AX_STYLES = ['ax-up', 'ax-left', 'ax-right', 'ax-zoom', 'ax-blur', 'ax-down'];
var axSeed = 0;
function axAdvance(el) {
  var n = ((+el.dataset.ax || 0) + 1) % AX_STYLES.length;
  el.dataset.ax = n;
  AX_STYLES.forEach(function (c) { el.classList.remove(c); });
  el.classList.add(AX_STYLES[n]);
}
function revealCheck() {
  var vh = window.innerHeight || document.documentElement.clientHeight;
  var els = document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-z');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var r = el.getBoundingClientRect();
    if (!r.height) continue;
    var vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if ((vis / r.height) >= 0.12) {
      el.classList.add('visible');
    } else if (el.classList.contains('visible')) {
      el.classList.remove('visible');
      axAdvance(el);
    }
  }
}
var revealTick = false;
function revealSoon() {
  if (revealTick) return;
  revealTick = true;
  requestAnimationFrame(function () { revealTick = false; revealCheck(); });
}
document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-z').forEach(function (el) {
  el.classList.add('reveal');
  var n = (axSeed++) % AX_STYLES.length;
  el.dataset.ax = n;
  el.classList.add(AX_STYLES[n]);
});
document.addEventListener('scroll', revealSoon, { passive: true });
window.addEventListener('resize', revealSoon);
window.addEventListener('load', revealCheck);
revealCheck();

// Hero name: word-safe letter-by-letter entrance (words never split across lines)
(function () {
  var h1 = document.querySelector('.hero h1');
  if (!h1) return;
  var idx = 0;
  function wrap(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
      if (ch.nodeType === 3) {
        var frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          var w = document.createElement('span');
          w.className = 'w';
          Array.prototype.slice.call(part).forEach(function (c) {
            var sp = document.createElement('span');
            sp.className = 'ltr';
            sp.style.animationDelay = (idx++ * 0.02) + 's';
            sp.textContent = c;
            w.appendChild(sp);
          });
          frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1) { wrap(ch); }
    });
  }
  wrap(h1);
})();

// Animated counters - restart every time they scroll into view
var counterIO = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    var el = e.target;
    if (!e.isIntersecting) { el.dataset.done = ''; return; }
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = +el.dataset.count, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1300, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(function (el) { counterIO.observe(el); });

// When the page is restored from the back-forward cache, replay all animations
window.addEventListener('pageshow', function (e) {
  if (!e.persisted) return;
  document.querySelectorAll('.reveal.visible,.reveal-l.visible,.reveal-r.visible,.reveal-z.visible').forEach(function (el) {
    el.classList.remove('visible');
  });
  void document.body.offsetHeight;
  if (typeof revealCheck === 'function') revealCheck();
  document.querySelectorAll('[data-count]').forEach(function (el) {
    el.textContent = '0';
    el.dataset.done = '';
  });
});

// Scrollytelling: desktop = scroll-driven crossfade; mobile = finger swipe on the image
(function () {
  var steps = document.querySelectorAll('.story-step');
  var imgs = document.querySelectorAll('.story-visual img');
  var visual = document.querySelector('.story-visual');
  var count = document.getElementById('storyCount');
  if (!steps.length || !imgs.length) return;
  var current = 0;
  function setStory(i) {
    current = Math.max(0, Math.min(imgs.length - 1, i));
    imgs.forEach(function (im, k) { im.classList.toggle('active', k === current); });
    steps.forEach(function (s, k) { s.classList.toggle('active', k === current); });
    if (count) count.textContent = (current + 1) + ' / ' + imgs.length;
  }
  var mobileMq = window.matchMedia('(max-width: 920px)');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (mobileMq.matches) return; // mobile uses swipe, not scroll
      setStory(+e.target.dataset.step || 0);
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  steps.forEach(function (s) { io.observe(s); });
  // Finger swipe (left/right) on the image — mobile
  if (visual) {
    var tx = null, ty = null;
    visual.addEventListener('touchstart', function (e) {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    }, { passive: true });
    visual.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      tx = null;
      if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
      setStory(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }
  // Prev/next arrows (shown on mobile)
  var prevBtn = document.querySelector('.story-prev');
  var nextBtn = document.querySelector('.story-next');
  if (prevBtn) prevBtn.addEventListener('click', function () { setStory(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { setStory(current + 1); });
})();

// 3D tilt on certificate cards (desktop only)
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.cert-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(900px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
})();

// Footer year
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ============ HEAVY ANIMATION PACK ============ */
(function(){
  "use strict";

  /* ---- Scroll progress bar ---- */
  var prog = document.createElement('div');
  prog.className = 'scroll-progress';
  prog.innerHTML = '<span id="scrollProgressBar"></span>';
  document.body.prepend(prog);
  var bar = document.getElementById('scrollProgressBar');
  function updateProgress(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  /* ---- Particle molecule canvas ---- */
  function initParticles(id, color, count){
    var c = document.getElementById(id);
    if(!c) return;
    var ctx = c.getContext('2d'), W, H, pts = [], mouse = {x:-9999, y:-9999};
    function resize(){
      var r = c.parentElement.getBoundingClientRect();
      W = c.width = r.width; H = c.height = r.height;
    }
    resize(); window.addEventListener('resize', resize);
    for(var i=0;i<count;i++){
      pts.push({x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5,
        r:Math.random()*2.2+1});
    }
    c.parentElement.addEventListener('mousemove', function(e){
      var r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    c.parentElement.addEventListener('mouseleave', function(){ mouse.x = -9999; mouse.y = -9999; });
    (function tick(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<pts.length;i++){
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx*dx+dy*dy);
        if(d < 130 && d > 0){ p.x += dx/d*.9; p.y += dy/d*.9; }
        if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
        if(p.x>W) p.x=0; if(p.x<0) p.x=W; if(p.y>H) p.y=0; if(p.y<0) p.y=H;
      }
      ctx.lineWidth = 1;
      for(var a=0;a<pts.length;a++){
        for(var b=a+1;b<pts.length;b++){
          var pa=pts[a], pb=pts[b], ddx=pa.x-pb.x, ddy=pa.y-pb.y, dd=Math.sqrt(ddx*ddx+ddy*ddy);
          if(dd<130){
            ctx.strokeStyle = color.replace('A', (0.14*(1-dd/130)).toFixed(3));
            ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
          }
        }
        ctx.fillStyle = color.replace('A','0.7');
        ctx.beginPath(); ctx.arc(pts[a].x, pts[a].y, pts[a].r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(tick);
    })();
  }
  initParticles('hero-particles', 'rgba(79,216,199,A)', 70);
  initParticles('research-particles', 'rgba(52,211,153,A)', 60);
  document.querySelectorAll('canvas.ph-particles').forEach(function (c) {
    if (c.id) initParticles(c.id, 'rgba(255,255,255,A)', 45);
  });

  /* ---- Typewriter (hero subtitle) ---- */
  var tw = document.getElementById('typewriter');
  if(tw){
    var roles = ['Medical Laboratory Scientist','Computational Biologist','Molecular Modeler'];
    var ri=0, ci=0, del=false;
    (function type(){
      var word = roles[ri];
      tw.textContent = word.slice(0, ci);
      var speed = del ? 32 : 70;
      if(!del && ci === word.length){ speed = 1600; del = true; }
      else if(del && ci === 0){ del = false; ri = (ri+1)%roles.length; speed = 350; }
      ci += del ? -1 : 1;
      setTimeout(type, speed);
    })();
  }

  /* ---- Magnetic buttons ---- */
  if(window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('mousemove', function(e){
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
        b.style.transform = 'translate('+(x*.18)+'px,'+(y*.28)+'px)';
      });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  /* ---- Generic 3D tilt for [data-tilt] ---- */
  if(window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('[data-tilt]').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top)/r.height - .5) * -10;
        var ry = ((e.clientX - r.left)/r.width - .5) * 12;
        el.style.transform = 'perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }
})();

// Click ripple + press animation on nav links and buttons
(function () {
  function attach(scope) {
    Array.prototype.slice.call(scope.querySelectorAll('.nav a, .btn')).forEach(function (el) {
      if (el.__ripple) return;
      el.__ripple = true;
      el.addEventListener('click', function (e) {
        var r = el.getBoundingClientRect();
        var d = Math.max(r.width, r.height) * 1.15;
        var s = document.createElement('span');
        s.className = 'click-ripple';
        s.style.width = s.style.height = d + 'px';
        var x = (e.clientX || (r.left + r.width / 2)) - r.left - d / 2;
        var y = (e.clientY || (r.top + r.height / 2)) - r.top - d / 2;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        el.appendChild(s);
        setTimeout(function () { s.remove(); }, 650);
      });
    });
  }
  attach(document);
})();

// Instant-feel navigation: prefetch internal pages on hover / touch so clicks open fast
(function () {
  var seen = {};
  function prefetch(href) {
    if (!href || seen[href]) return;
    seen[href] = 1;
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = href;
    document.head.appendChild(l);
  }
  function fromEvent(e) {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^[a-z]+:/i.test(href)) return;
    if (/\.html?(?:[?#]|$)/i.test(href) || /^\/[a-z0-9-]*\/?(?:[?#]|$)/i.test(href)) prefetch(href);
  }
  document.addEventListener('mouseover', fromEvent, { passive: true });
  document.addEventListener('touchstart', fromEvent, { passive: true });
})();
