/* ============================================
   STOP DE GOTERAS - SOY JUAN
   Main JavaScript + Animaciones
   ============================================ */
(function () {
  'use strict';

  // ---------- HEADER SCROLL ----------
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('header--scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ---------- MOBILE MENU ----------
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var navLinks = document.querySelectorAll('.header__link');
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- COUNTER ANIMATION ----------
  function animateCounters() {
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function (counter) {
      if (counter.dataset.animated) return;
      var rect = counter.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        counter.dataset.animated = 'true';
        var target = parseInt(counter.dataset.count, 10);
        var duration = 2000;
        var startTime = null;
        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else counter.textContent = target;
        }
        requestAnimationFrame(step);
      }
    });
  }
  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

  // ---------- FADE-UP ON SCROLL ----------
  var fadeElements = document.querySelectorAll(
    '.service-card, .about__image, .about__content, .gallery__item, .contact__form, .contact__info, .section-header, .service-detail, .value-card'
  );
  fadeElements.forEach(function (el) { el.classList.add('fade-up'); });
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  fadeElements.forEach(function (el) { fadeObserver.observe(el); });

  // ---------- RAIN CANVAS ----------
  var rainCanvas = document.getElementById('rainCanvas');
  if (rainCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ctx = rainCanvas.getContext('2d');
    var drops = [];
    var splashes = [];
    var W, H;

    function resizeRain() {
      var parent = rainCanvas.parentElement;
      W = rainCanvas.width = parent.offsetWidth;
      H = rainCanvas.height = parent.offsetHeight;
    }
    resizeRain();
    window.addEventListener('resize', resizeRain);

    // Collision detection
    var roofLeft = 0, roofRight = 0, roofMid = 0, roofPeak = 0, roofBase = 0;
    var shieldCx = 0, shieldCy = 0, shieldR = 0;
    var hasShield = false;
    var isHomePage = !!document.getElementById('heroScene');
    var isInnerPage = !!document.getElementById('pageRoof');
    var roofReady = isInnerPage; // Inner pages: roof visible immediately
    if (isHomePage) setTimeout(function () { roofReady = true; }, 6000);

    function calcRoofPos() {
      var heroRect = rainCanvas.parentElement.getBoundingClientRect();

      if (isHomePage) {
        var sceneEl = document.getElementById('heroScene');
        if (!sceneEl) return;
        var rect = sceneEl.getBoundingClientRect();
        var sx = rect.left - heroRect.left;
        var sy = rect.top - heroRect.top;
        var sw = rect.width;
        var sh = rect.height;
        // SVG viewBox 520x440, roof: 125,195 → 260,115 → 395,195
        roofLeft  = sx + (125 / 520) * sw;
        roofRight = sx + (395 / 520) * sw;
        roofMid   = sx + (260 / 520) * sw;
        roofPeak  = sy + (115 / 440) * sh;
        roofBase  = sy + (195 / 440) * sh;
        // Shield SVG center 430,108
        shieldCx = sx + (430 / 520) * sw;
        shieldCy = sy + (108 / 440) * sh;
        shieldR  = (30 / 520) * sw;
        hasShield = true;
      }

      if (isInnerPage) {
        var roofEl = document.getElementById('pageRoof');
        if (!roofEl) return;
        var rr = roofEl.getBoundingClientRect();
        var rx = rr.left - heroRect.left;
        var ry = rr.top - heroRect.top;
        var rw = rr.width;
        var rh = rr.height;
        // SVG viewBox 100x100, roof: -5,75 → 50,18 → 105,75
        roofLeft  = rx + (-5 / 100) * rw;
        roofRight = rx + (105 / 100) * rw;
        roofMid   = rx + 0.5 * rw;
        roofPeak  = ry + 0.18 * rh;
        roofBase  = ry + 0.75 * rh;
        hasShield = false;
      }
    }
    calcRoofPos();
    window.addEventListener('resize', calcRoofPos);

    function getRoofY(x) {
      if (!roofReady) return H + 50;
      // Shield collision (home page only)
      if (hasShield) {
        var dx = x - shieldCx;
        if (Math.abs(dx) < shieldR) {
          var dy = Math.sqrt(shieldR * shieldR - dx * dx);
          var shieldTop = shieldCy - dy;
          if (shieldTop > 0) {
            var ry = H + 50;
            if (x >= roofLeft && x <= roofRight) {
              if (x <= roofMid) ry = roofBase - ((x - roofLeft) / (roofMid - roofLeft)) * (roofBase - roofPeak);
              else ry = roofPeak + ((x - roofMid) / (roofRight - roofMid)) * (roofBase - roofPeak);
            }
            return Math.min(shieldTop, ry);
          }
        }
      }
      // Roof triangle collision
      if (x < roofLeft || x > roofRight) return H + 50;
      if (x <= roofMid) {
        return roofBase - ((x - roofLeft) / (roofMid - roofLeft)) * (roofBase - roofPeak);
      }
      return roofPeak + ((x - roofMid) / (roofRight - roofMid)) * (roofBase - roofPeak);
    }

    var isMobile = W < 768;
    var isInner = isInnerPage;
    function createDrop() {
      var slow = isMobile || isInner;
      return {
        x: Math.random() * W,
        y: -20 - Math.random() * 100,
        speed: slow ? (2.5 + Math.random() * 3) : (5 + Math.random() * 7),
        length: slow ? (8 + Math.random() * 12) : (14 + Math.random() * 22),
        opacity: isInner ? (0.08 + Math.random() * 0.12) : (0.12 + Math.random() * 0.2),
        wind: slow ? (-0.6 - Math.random() * 0.8) : (-1.5 - Math.random() * 2)
      };
    }

    var dropCount;
    if (isMobile) dropCount = Math.min(Math.floor(W / 12), 50);
    else if (isInner) dropCount = Math.min(Math.floor(W / 16), 60);
    else dropCount = Math.min(Math.floor(W / 7), 140);
    for (var i = 0; i < dropCount; i++) {
      var d = createDrop();
      d.y = Math.random() * H;
      drops.push(d);
    }

    function createSplash(x, y) {
      for (var j = 0; j < 4; j++) {
        splashes.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 4,
          vy: -1.5 - Math.random() * 2.5,
          life: 1,
          size: 1 + Math.random() * 1.5
        });
      }
    }

    function drawRain() {
      ctx.clearRect(0, 0, W, H);

      // Drops
      for (var i = drops.length - 1; i >= 0; i--) {
        var drop = drops[i];
        drop.y += drop.speed;
        drop.x += drop.wind;
        var roofY = getRoofY(drop.x);
        if (drop.y >= roofY) {
          createSplash(drop.x, roofY);
          drops[i] = createDrop();
          continue;
        }
        if (drop.y > H + 20) { drops[i] = createDrop(); continue; }
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.wind * 0.5, drop.y + drop.length);
        ctx.strokeStyle = 'rgba(120,180,255,' + drop.opacity + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Splashes
      for (var s = splashes.length - 1; s >= 0; s--) {
        var sp = splashes[s];
        sp.x += sp.vx; sp.y += sp.vy;
        sp.vy += 0.15; sp.life -= 0.04;
        if (sp.life <= 0) { splashes.splice(s, 1); continue; }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140,200,255,' + (sp.life * 0.5) + ')';
        ctx.fill();
      }

      requestAnimationFrame(drawRain);
    }
    drawRain();
  }

  // ---------- SPARKS CANVAS ----------
  var sparksCanvas = document.getElementById('sparksCanvas');
  if (sparksCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var sCtx = sparksCanvas.getContext('2d');
    var sparks = [];
    var sW, sH;

    function resizeSparks() {
      var parent = sparksCanvas.parentElement;
      sW = sparksCanvas.width = parent.offsetWidth;
      sH = sparksCanvas.height = parent.offsetHeight;
    }
    resizeSparks();
    window.addEventListener('resize', resizeSparks);

    function emitSpark() {
      if (sparks.length > 35) return;
      var x = sW * 0.55 + Math.random() * sW * 0.35;
      var y = sH * 0.25 + Math.random() * sH * 0.4;
      for (var i = 0; i < 2 + Math.floor(Math.random() * 4); i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 1 + Math.random() * 3;
        sparks.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 0.5 + Math.random() * 0.7,
          size: 1 + Math.random() * 2,
          color: Math.random() > 0.5 ? '255,160,50' : '255,210,80'
        });
      }
    }
    setInterval(emitSpark, 700);

    function drawSparks() {
      sCtx.clearRect(0, 0, sW, sH);
      for (var i = sparks.length - 1; i >= 0; i--) {
        var sp = sparks[i];
        sp.x += sp.vx; sp.y += sp.vy;
        sp.vy += 0.05; sp.life -= 0.015;
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        var a = sp.life * 0.8;
        sCtx.beginPath();
        sCtx.arc(sp.x, sp.y, sp.size * 3, 0, Math.PI * 2);
        sCtx.fillStyle = 'rgba(' + sp.color + ',' + (a * 0.12) + ')';
        sCtx.fill();
        sCtx.beginPath();
        sCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        sCtx.fillStyle = 'rgba(' + sp.color + ',' + a + ')';
        sCtx.fill();
      }
      requestAnimationFrame(drawSparks);
    }
    drawSparks();
  }

  // ---------- LIGHTBOX ----------
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lightboxImg = lightbox.querySelector('.lightbox__img');
    var lightboxClose = lightbox.querySelector('.lightbox__close');
    var lightboxPrev = lightbox.querySelector('.lightbox__prev');
    var lightboxNext = lightbox.querySelector('.lightbox__next');
    var galleryItems = document.querySelectorAll('.gallery__item');
    var currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      var img = galleryItems[index].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    function navigateLightbox(dir) {
      currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
      var img = galleryItems[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    galleryItems.forEach(function (item, i) {
      item.addEventListener('click', function () { openLightbox(i); });
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () { navigateLightbox(-1); });
    lightboxNext.addEventListener('click', function () { navigateLightbox(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  // ---------- FORM SUBMIT ----------
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      var btn = contactForm.querySelector('.form-submit');
      btn.textContent = 'Enviando...';
      btn.style.opacity = '0.7';
      btn.disabled = true;
    });
  }

  var reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function () {
      var btn = reviewForm.querySelector('.form-submit');
      btn.textContent = 'Enviando opinión...';
      btn.style.opacity = '0.7';
      btn.disabled = true;
    });
  }

  // Mostrar aviso tras envío correcto (?enviada=1)
  if (/[?&]enviada=1/.test(window.location.search)) {
    var notice = document.createElement('div');
    notice.className = 'form-success';
    notice.setAttribute('role', 'status');
    notice.textContent = '¡Gracias! Hemos recibido tu opinión. La revisaremos y la publicaremos pronto.';
    notice.style.cssText = 'position:fixed;top:90px;left:50%;transform:translateX(-50%);background:#1B2A4A;color:#fff;padding:14px 22px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.2);z-index:1800;font-family:"Open Sans",sans-serif;font-size:14px;max-width:92%;text-align:center;';
    document.body.appendChild(notice);
    setTimeout(function () { notice.style.opacity = '0'; notice.style.transition = 'opacity .4s'; }, 5000);
    setTimeout(function () { notice.remove(); }, 5500);
  }

  // ---------- COOKIE BANNER ----------
  var banner = document.getElementById('cookieBanner');
  if (banner) {
    var accepted = false;
    try { accepted = document.cookie.indexOf('cookie_consent=1') !== -1; } catch (e) { accepted = false; }
    if (!accepted) {
      banner.hidden = false;
      requestAnimationFrame(function () { banner.classList.add('is-visible'); });
      var acceptBtn = document.getElementById('cookieAccept');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
          var expires = new Date();
          expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
          try {
            document.cookie = 'cookie_consent=1; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';
          } catch (e) { /* cookies disabled */ }
          banner.classList.remove('is-visible');
          setTimeout(function () { banner.hidden = true; }, 350);
        });
      }
    }
  }

})();
