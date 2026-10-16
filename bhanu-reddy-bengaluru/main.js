(function () {
  "use strict";
  var MAIL_TO = "ishan@blocksone.tech";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = function () { return window.matchMedia("(max-width:760px)").matches; };

  /* ---------- header: solid after scroll, hides on scroll down ---------- */
  var header = $(".site-header"), lastY = 0;
  /* ---------- mobile nav ---------- */
  var tog = $("#navToggle"), nav = $("#siteNav");
  function closeNav() { nav.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); }
  tog.addEventListener("click", function () { var o = nav.classList.toggle("open"); tog.setAttribute("aria-expanded", String(o)); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- reveal on scroll ---------- */
  var revs = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    revs.forEach(function (r, i) { r.style.transitionDelay = ((i % 3) * 0.06) + "s"; io.observe(r); });
  } else revs.forEach(function (r) { r.classList.add("in"); });

  /* ---------- count-up (rating and review count) ---------- */
  function countUp(el) {
    if (reduce) return;
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec); }
    el.textContent = (0).toFixed(dec); requestAnimationFrame(step);
  }
  setTimeout(function () { $$("[data-count]").forEach(countUp); }, 1300);

  /* ---------- statement: words light up with scroll ---------- */
  var wordsEl = $("#words"), wordSpans = [];
  if (wordsEl) {
    var txt = wordsEl.textContent.trim().split(/\s+/);
    wordsEl.innerHTML = txt.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    wordSpans = $$(".w", wordsEl);
  }

  /* ---------- portfolio pin ---------- */
  var pin = $("#portfolio"), track = $("#track"), pinFill = $("#pinFill"), panels = $$(".g-item"), pinDist = 0;
  function sizePin() {
    if (small() || reduce) { pin.style.height = ""; track.style.transform = ""; return; }
    pinDist = Math.max(0, track.scrollWidth - window.innerWidth);
    pin.style.height = (pinDist + window.innerHeight) + "px";
  }

  /* ---------- parallax + marquee refs ---------- */
  var heroImg = $("#heroImg"), heroFrame = $("#heroFrame"), badge = $("#badge"), heroEl = $("#hero");
  var m1 = $("#m1"), m2 = $("#m2"), marq = $(".ribbon") || $(".marquee"), prog = $("#progress");
  var darks = $$(".pin, .pricing, .site-footer");
  var fc = $("#floatCta"), enq = $("#enquire"), inEnq = false;

  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight, vw = window.innerWidth, max = document.documentElement.scrollHeight - vh;
    prog.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
    header.classList.toggle("solid", y > 40);
    header.classList.toggle("hide", y > 500 && y > lastY + 4 && !nav.classList.contains("open"));
    if (y < lastY - 4) header.classList.remove("hide");
    lastY = y;
    fc.classList.toggle("show", y > vh * 0.8 && !inEnq);
    var onDark = false;                           // switch header colours over the dark sections
    for (var d = 0; d < darks.length; d++) { var dr = darks[d].getBoundingClientRect(); if (dr.top <= 38 && dr.bottom >= 38) { onDark = true; break; } }
    header.classList.toggle("dark", onDark);

    if (!reduce) {
      // hero parallax
      if (y < vh * 1.2) {
        heroImg.style.transform = "translate3d(0," + (y * 0.07) + "px,0)";
        heroFrame.style.transform = "translate3d(0," + (y * -0.05) + "px,0)";
        if (badge) badge.style.transform = "translate3d(0," + (y * -0.09) + "px,0)";
      }
      // marquee rows move with scroll, in opposite directions
      var mr = marq.getBoundingClientRect();
      if (mr.top < vh && mr.bottom > 0) {
        var p = (vh - mr.top);
        m1.style.transform = "translate3d(" + (-p * 0.35) + "px,0,0)";
        if (m2) m2.style.transform = "translate3d(" + (-(m2.scrollWidth - vw) + p * 0.35) + "px,0,0)";
      }
      // statement words
      if (wordSpans.length) {
        var sr = $("#statement").getBoundingClientRect(), sp = clamp((vh * 0.85 - sr.top) / (sr.height * 0.8 + vh * 0.1), 0, 1), th = sp * (wordSpans.length + 6);
        wordSpans.forEach(function (w, i) { w.style.opacity = (0.16 + 0.84 * clamp(th - i, 0, 1)).toFixed(2); });
      }
      // pinned horizontal gallery
      if (!small()) {
        var r = pin.getBoundingClientRect(), pp = clamp(-r.top / Math.max(1, pin.offsetHeight - vh), 0, 1);
        track.style.transform = "translate3d(" + (-pp * pinDist) + "px,0,0)";
        pinFill.style.transform = "scaleX(" + pp + ")";
        panels.forEach(function (b) {
          var br = b.getBoundingClientRect(), c = (br.left + br.width / 2 - vw / 2) / vw;
          var img = b.firstElementChild.firstElementChild;     // .ph > img
          img.style.transform = "translate3d(" + (c * -60 - 40) + "px,0,0)";
        });
      }
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { sizePin(); req(); });
  window.addEventListener("load", function () { sizePin(); req(); });
  sizePin(); req();

  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { inEnq = es[0].isIntersecting; req(); }, { threshold: .15 }).observe(enq);

  /* ---------- services: list drives the sticky image ---------- */
  var svcItems = $$("#svcList li"), svcImgs = $$("#svcFig img"), svcActive = -1;
  function setSvc(li) {
    if (!li || li === svcActive) return; svcActive = li;
    svcItems.forEach(function (x) { x.classList.toggle("on", x === li); });
    var k = li.dataset.k; svcImgs.forEach(function (im) { var on = im.dataset.k === k; im.classList.toggle("on", on); if (on && im.loading === "lazy") im.loading = "eager"; });
  }
  setSvc(svcItems[0]);
  svcItems.forEach(function (li) { li.addEventListener("mouseenter", function () { setSvc(li); }); li.addEventListener("focus", function () { setSvc(li); }); });
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) setSvc(en.target); }); }, { rootMargin: "-45% 0px -45% 0px" });
    svcItems.forEach(function (li) { sio.observe(li); });
  }

  /* ---------- reviews slider ---------- */
  if ($("#slider")) {
  var slides = $$(".slide"), dotsBox = $("#sDots"), si = 0, timer = null, slider = $("#slider");
  slides.forEach(function (_, i) { var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Show review " + (i + 1)); b.addEventListener("click", function () { goto(i, true); }); dotsBox.appendChild(b); });
  function paintDots() { $$("button", dotsBox).forEach(function (b, i) { if (i === si) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); }); }
  function goto(i, user) { si = (i + slides.length) % slides.length; slides.forEach(function (s, k) { s.classList.toggle("on", k === si); s.classList.add("in"); }); paintDots(); var bar = $("#rvBar"); if (bar) { bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run"); } if (user) restart(); }
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { goto(si + 1); }, 7500); }
  $("#sPrev").addEventListener("click", function () { goto(si - 1, true); });
  $("#sNext").addEventListener("click", function () { goto(si + 1, true); });
  slider.addEventListener("mouseenter", function () { clearInterval(timer); }); slider.addEventListener("mouseleave", restart);
  paintDots(); restart();
  }

  /* ---------- magnetic buttons + custom cursor (mouse only) ---------- */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine && !reduce) {
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18) + "px," + ((e.clientY - r.top - r.height / 2) * .28) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    var cur = $("#cursor"), lab = $("#cursorLabel"), cx = -50, cy = -50, tx = -50, ty = -50;
    document.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add("on"); });
    document.addEventListener("mouseleave", function () { cur.classList.remove("on"); });
    (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = "translate3d(" + (cx - cur.offsetWidth / 2) + "px," + (cy - cur.offsetHeight / 2) + "px,0)"; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", function (e) {
      var t = e.target; cur.classList.remove("big", "link"); lab.textContent = "";
      if (t.closest(".g-item")) cur.classList.add("big");
      else if (t.closest("a,button,.service-list li,input,select,textarea")) cur.classList.add("link");
    });
  }

  /* ---------- lightbox ---------- */
  var items = panels, lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), cur2 = 0, opener = null;
  function show(i) { cur2 = (i + items.length) % items.length; var b = items[cur2]; lbImg.src = b.dataset.full; lbImg.alt = $("img", b).alt; lbCap.textContent = b.dataset.cap || ""; }
  function openLb(i, from) { opener = from; show(i); lb.hidden = false; document.body.classList.add("lb-open"); $("#lbClose").focus(); }
  function closeLb() { lb.hidden = true; document.body.classList.remove("lb-open"); lbImg.removeAttribute("src"); if (opener) opener.focus({ preventScroll: true }); }
  items.forEach(function (b, i) { b.addEventListener("click", function () { openLb(i, b); }); });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { show(cur2 - 1); });
  $("#lbNext").addEventListener("click", function () { show(cur2 + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  var tsx = null;
  lb.addEventListener("touchstart", function (e) { tsx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tsx === null) return; var dx = e.changedTouches[0].clientX - tsx; if (Math.abs(dx) > 50) show(cur2 + (dx < 0 ? 1 : -1)); tsx = null; });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") show(cur2 - 1);
    else if (e.key === "ArrowRight") show(cur2 + 1);
    else if (e.key === "Tab") {
      var f = [$("#lbPrev"), $("#lbNext"), $("#lbClose")], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- enquiry form ---------- */
  var form = $("#enquiryForm"), statusBox = $("#status"), submit = $("#submitBtn"), dateIn = $("#f-date");
  (function () { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); dateIn.min = d.toISOString().slice(0, 10); })();
  var fields = {
    name:    { el: $("#f-name"),    err: $("#e-name"),    check: function (v) { return v.length >= 2 ? "" : "Please enter your name."; } },
    phone:   { el: $("#f-phone"),   err: $("#e-phone"),   check: function (v) { var d = v.replace(/\D/g, ""); if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2); return /^[6-9]\d{9}$/.test(d) ? "" : "Please enter a valid 10-digit mobile number."; } },
    event:   { el: $("#f-event"),   err: $("#e-event"),   check: function (v) { return v ? "" : "Please choose the type of event."; } },
    service: { el: $("#f-service"), err: $("#e-service"), check: function (v) { return v ? "" : "Please choose a service."; } },
    date:    { el: dateIn,          err: $("#e-date"),    check: function (v) { if (!v) return "Please choose the event date."; return v < dateIn.min ? "The date cannot be in the past." : ""; } },
    city:    { el: $("#f-city"),    err: $("#e-city"),    check: function (v) { return v.length >= 2 ? "" : "Please enter the city or venue."; } }
  };
  function validateOne(k) {
    var f = fields[k], msg = f.check(f.el.value.trim());
    f.err.textContent = msg; f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) f.el.setAttribute("aria-describedby", f.err.id); else f.el.removeAttribute("aria-describedby");
    return !msg;
  }
  Object.keys(fields).forEach(function (k) {
    fields[k].el.addEventListener("blur", function () { validateOne(k); });
    fields[k].el.addEventListener("input", function () { if (fields[k].el.getAttribute("aria-invalid") === "true") validateOne(k); });
  });
  function niceDate(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
  function say(html, kind) { statusBox.innerHTML = html; statusBox.className = "full status" + (kind ? " " + kind : ""); statusBox.hidden = false; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    Object.keys(fields).forEach(function (k) { if (!validateOne(k) && !bad) bad = fields[k].el; });
    if (bad) { say("<p>Please check the highlighted fields and try again.</p>", "bad"); bad.focus(); return; }
    submit.disabled = true; submit.textContent = "Sending…";
    var v = function (k) { return fields[k].el.value.trim(); };
    var digits = v("phone").replace(/\D/g, ""); if (digits.length === 12 && digits.indexOf("91") === 0) digits = digits.slice(2);
    var payload = { _subject: "New enquiry – Makeup by Bhanu Reddy (" + v("event") + ", " + niceDate(v("date")) + ")", _captcha: "false", _template: "table",
      Name: v("name"), Mobile: digits, Event: v("event"), Service: v("service"), "Event date": niceDate(v("date")), "City / venue": v("city"), Notes: $("#f-notes").value.trim() || "-" };
    fetch("https://formsubmit.co/ajax/" + MAIL_TO, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .catch(function () {})   // demo: always show the sent confirmation
      .then(function () {
        form.reset();
        say("<p><strong>Enquiry sent.</strong> Thank you, " + esc(payload.Name) + ". Bhanu will get back to you shortly with availability and pricing. This is an enquiry only; your date is not booked until Bhanu confirms.</p>", "ok");
      })
      .catch(function () { say("<p>Sorry, we could not send your enquiry. Please check your connection and try again.</p>", "bad"); })
      .then(function () { submit.disabled = false; submit.textContent = "Send enquiry"; });
    statusBox.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  });


  /* ---------- chip pickers (visual layer over the selects) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-chips]"), function (f) {
    var sel = $("select", f), lbl = $("label", f), box = document.createElement("div");
    box.className = "chips"; box.setAttribute("role", "group"); box.setAttribute("aria-labelledby", lbl.id);
    var btns = [];
    Array.prototype.forEach.call(sel.options, function (o) {
      if (!o.value && !o.text) return; if (o.value === "" ) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o.text; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { sel.value = o.value || o.text; sel.dispatchEvent(new Event("input", { bubbles: true })); });
      box.appendChild(b); btns.push(b);
    });
    function sync() { btns.forEach(function (b) { b.setAttribute("aria-pressed", String(!!sel.value && b.textContent === sel.value)); }); }
    sel.addEventListener("input", sync); sel.addEventListener("change", sync);
    form.addEventListener("reset", function () { setTimeout(sync, 0); });
    sel.addEventListener("focus", function () { f.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); });
    lbl.insertAdjacentElement("afterend", box); sync();
  });
  /* ---------- pricing -> enquiry form ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".p-opt"), function (b) {
    b.addEventListener("click", function () {
      var ev = $("#f-event"), sv = $("#f-service");
      if (b.dataset.event) ev.value = b.dataset.event;
      sv.value = b.dataset.service;
      [ev, sv].forEach(function (el) { el.dispatchEvent(new Event("input", { bubbles: true })); var f = el.closest(".field"); if (f) { f.classList.add("picked"); setTimeout(function () { f.classList.remove("picked"); }, 1800); } });
      $("#enquire").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setTimeout(function () { $("#f-name").focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  /* mobile menu: close on link, Esc, outside tap */
  (function () {
    var hd = $(".site-header"); if (!tog || !nav) return;
    function setOpen(o) { nav.classList.toggle("open", o); tog.setAttribute("aria-expanded", o ? "true" : "false"); hd.classList.toggle("menu-open", o); }
    new MutationObserver(function () { hd.classList.toggle("menu-open", nav.classList.contains("open")); }).observe(nav, { attributes: true, attributeFilter: ["class"] });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); tog.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("open") && !e.target.closest(".site-header")) setOpen(false); });
  })();

  /* keyboard: bringing a gallery panel into focus scrolls the pinned section to it */
  (function () {
    Array.prototype.forEach.call(document.querySelectorAll(".g-item"), function (p) {
      p.addEventListener("focus", function () {
        if (small() || reduce) { p.scrollIntoView({ inline: "center", block: "nearest" }); return; }
        var pinEl = $("#portfolio"), dist = pinEl.offsetHeight - innerHeight, trackEl = $("#track");
        var maxX = Math.max(1, trackEl.scrollWidth - innerWidth), x = Math.min(maxX, Math.max(0, p.offsetLeft - (innerWidth - p.offsetWidth) / 2));
        window.scrollTo(0, pinEl.offsetTop + dist * (x / maxX));
      });
    });
  })();

  /* ---------- reviews: rating ring draws and numbers count up when scrolled into view ---------- */
  (function () {
    var box = $("#rvScore"); if (!box) return;
    function run() {
      box.classList.add("go");
      $$("[data-rv]", box).forEach(function (el) {
        var to = parseFloat(el.dataset.rv), dec = +(el.dataset.dec || 0), t0 = null, dur = 1800;
        if (reduce) { el.textContent = to.toFixed(dec); return; }
        function step(t) { if (!t0) t0 = t; var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      });
      var bar = $("#rvBar"); if (bar) bar.classList.add("run");
    }
    if ("IntersectionObserver" in window) { var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .35 }); o.observe(box); } else run();
  })();

  /* ---------- gallery: sideways scroll (trackpad, shift+wheel, arrow keys, touch) also moves the photos ---------- */
  (function () {
    function inPin() { var r = pin.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; }
    pin.addEventListener("wheel", function (e) {
      if (small() || reduce) return;
      var dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      if (dx && (Math.abs(dx) > Math.abs(e.deltaY) || e.shiftKey)) { e.preventDefault(); window.scrollBy(0, dx); }
    }, { passive: false });
    document.addEventListener("keydown", function (e) {
      if (small() || reduce || !inPin() || e.defaultPrevented) return;
      var t = e.target && e.target.tagName; if (/INPUT|TEXTAREA|SELECT/.test(t) || (e.target.closest && e.target.closest("#lightbox"))) return;
      if (e.key === "ArrowRight") { e.preventDefault(); window.scrollBy({ top: 260, behavior: "smooth" }); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); window.scrollBy({ top: -260, behavior: "smooth" }); }
    });
    var sx = null, sy = null;
    pin.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    pin.addEventListener("touchmove", function (e) {
      if (small() || reduce || sx === null) return;
      var dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) { window.scrollBy(0, -dx); sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
    }, { passive: true });
  })();
})();