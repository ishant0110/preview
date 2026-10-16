(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAIL_TO = "ishan@blocksone.tech";

  /* nav */
  var navBtn = $("#navBtn");
  if (navBtn) {
    navBtn.addEventListener("click", function () {
      var o = document.body.classList.toggle("nav-open");
      navBtn.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); navBtn.setAttribute("aria-expanded", "false"); }); });
  }

  /* anchors, back to top */
  function go(y) { window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!id || id === "top") { e.preventDefault(); go(0); return; }
      var t = document.getElementById(id); if (!t) return;
      e.preventDefault(); go(t.getBoundingClientRect().top + window.pageYOffset - 64);
    });
  });
  var toTop = $("#toTop"), hdr = $("#top");
  function onScroll() {
    if (toTop) toTop.classList.toggle("show", window.pageYOffset > 700);
    if (hdr) hdr.classList.toggle("scrolled", window.pageYOffset > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal on scroll (content is visible without JS) */
  var rev = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    rev.forEach(function (el) { el.classList.add("pre"); });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    rev.forEach(function (el) { io.observe(el); });
  }

  /* count-up */
  $$("[data-count]").forEach(function (el) {
    var end = parseFloat(String(el.getAttribute("data-count")).replace(/,/g, "")), dec = +(el.getAttribute("data-dec") || 0);
    if (isNaN(end) || reduce) return;
    var t0 = null, started = false;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1100); var v = end * (1 - Math.pow(1 - p, 3)); el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-IN"); if (p < 1) requestAnimationFrame(step); }
    function start() { if (started) return; started = true; requestAnimationFrame(step); }
    if ("IntersectionObserver" in window) { new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { start(); o.disconnect(); } }).observe(el); } else start();
  });

  /* lightbox */
  var items = $$(".g-item"), lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), cur = 0, opener = null;
  function show(i) { cur = (i + items.length) % items.length; var it = items[cur]; lbImg.src = it.getAttribute("data-full"); lbImg.alt = it.getAttribute("data-cap") || ""; lbCap.textContent = it.getAttribute("data-cap") || ""; }
  function openLb(i, btn) { if (!lb) return; opener = btn; show(i); lb.hidden = false; document.body.classList.add("lb-open"); $("#lbClose").focus(); }
  function closeLb() { if (!lb || lb.hidden) return; lb.hidden = true; document.body.classList.remove("lb-open"); if (opener) opener.focus(); }
  items.forEach(function (b, i) { b.addEventListener("click", function () { openLb(i, b); }); });
  if (lb) {
    $("#lbClose").addEventListener("click", closeLb);
    $("#lbPrev").addEventListener("click", function () { show(cur - 1); });
    $("#lbNext").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) { if (lb.hidden) return; if (e.key === "Escape") closeLb(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* chips over selects */
  function setSel(sel, val) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text === val || sel.options[i].value === val) { sel.selectedIndex = i; sel.dispatchEvent(new Event("change")); return; } } }
  $$("[data-chips]").forEach(function (f) {
    var sel = $("select", f); if (!sel) return;
    var box = document.createElement("div"); box.className = "chips"; var btns = [];
    Array.prototype.forEach.call(sel.options, function (o) {
      if (!o.value) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o.text;
      b.addEventListener("click", function () { sel.value = o.value; sel.dispatchEvent(new Event("change")); });
      btns.push(b); box.appendChild(b);
    });
    function sync() { var t = sel.selectedIndex >= 0 && sel.value ? sel.options[sel.selectedIndex].text : ""; btns.forEach(function (b) { b.classList.toggle("on", b.textContent === t); }); }
    sel.addEventListener("change", sync); f.appendChild(box); sync();
  });

  /* price row -> form */
  $$(".p-opt").forEach(function (b) {
    b.addEventListener("click", function () {
      var ev = b.getAttribute("data-event"), sv = b.getAttribute("data-service"), fe = $("#f-event"), fs = $("#f-service");
      if (fe && ev) setSel(fe, ev); if (fs && sv) setSel(fs, sv);
      var f = $("#enquiryForm"); if (f) go(f.getBoundingClientRect().top + window.pageYOffset - 80);
    });
  });

  /* form */
  var form = $("#enquiryForm");
  if (form) {
    var submit = $("#submitBtn"), statusBox = $("#status"), submitText = submit.textContent;
    var fields = { name: ["#f-name", "Please enter your name."], phone: ["#f-phone", "Enter a valid 10-digit mobile number."], event: ["#f-event", "Please choose an occasion."], service: ["#f-service", "Please choose a service."], date: ["#f-date", "Please pick a date."], city: ["#f-city", "Please tell us your area."] };
    Object.keys(fields).forEach(function (k) { if (!$(fields[k][0])) delete fields[k]; });
    function v(k) { return $(fields[k][0]).value.trim(); }
    function err(k, msg) { var el = $(fields[k][0]), e = $("#e-" + k); if (e) e.textContent = msg || ""; el.setAttribute("aria-invalid", msg ? "true" : "false"); }
    function validate(k) {
      var val = v(k), msg = ""; if (!val) msg = fields[k][1];
      if (k === "phone" && val) { var d = val.replace(/\D/g, ""); if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2); if (!/^[6-9]\d{9}$/.test(d)) msg = fields[k][1]; }
      err(k, msg); return !msg;
    }
    Object.keys(fields).forEach(function (k) { $(fields[k][0]).addEventListener("blur", function () { validate(k); }); });
    function niceDate(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
    function say(h, kind) { statusBox.innerHTML = h; statusBox.className = "full status " + (kind || ""); statusBox.hidden = false; }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null; Object.keys(fields).forEach(function (k) { if (!validate(k) && !bad) bad = $(fields[k][0]); });
      if (bad) { say("<p>Please check the highlighted fields and try again.</p>", "bad"); bad.focus(); return; }
      submit.disabled = true; submit.textContent = "Sending…";
      var digits = v("phone").replace(/\D/g, ""); if (digits.length === 12 && digits.indexOf("91") === 0) digits = digits.slice(2);
      var payload = { _subject: "New enquiry – Aashishtaj Photography (" + v("event") + ", " + niceDate(v("date")) + ")", _captcha: "false", _template: "table", Name: v("name"), Mobile: digits, Occasion: v("event"), Service: v("service"), Date: niceDate(v("date")), Area: v("city"), Notes: ($("#f-notes") && $("#f-notes").value.trim()) || "-" };
      fetch("https://formsubmit.co/ajax/" + MAIL_TO, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); }).catch(function () { })
        .then(function () {
          form.reset(); $$(".chip.on").forEach(function (c) { c.classList.remove("on"); });
          say("<p><strong>Enquiry sent.</strong> Thank you, " + esc(payload.Name) + ". Aashishtaj will get back to you shortly to confirm. This is an enquiry only; nothing is booked until Aashishtaj confirms.</p>", "ok");
        })
        .then(function () { submit.disabled = false; submit.textContent = submitText; });
      statusBox.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
  }
})();
