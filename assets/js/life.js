(function () {
  'use strict';

  var YEARS = 100;
  var ROW_A = 182;          // first row of each year
  var COLS = 184;           // second row holds 183 days, or 184 in a 366-day year
  var ROWS_PER_DECADE = 20; // 10 years x 2 rows
  var ROW_RATIO = 1.1;      // rows sit slightly farther apart than columns, as in the original
  var DECADE_GAP = 1;       // extra space between decades, in rows
  var DAY_MS = 86400000;
  var STORAGE_KEY = 'mylifeindays-dob';


  var chart = document.getElementById('life-chart');
  if (!chart) return;
  var canvas = chart.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var tip = document.getElementById('life-tip');
  var ring = document.getElementById('life-ring');
  var todayMark = document.getElementById('life-today');
  var input = document.getElementById('life-dob');
  var clearBtn = document.getElementById('life-clear');
  var stats = document.getElementById('life-stats');

  var dob = null;        // UTC ms of birth date, or null
  var yearStarts = [];   // day index at which each life-year begins (YEARS + 1 entries)
  var todayIndex = -1;   // day index of today, or -1 without a birth date
  var geom = null;
  var animFrame = 0;
  var colors = {};

  // Dot colors come from the page's light/dark theme variables.
  function readColors() {
    var style = getComputedStyle(document.documentElement);
    colors.future = style.getPropertyValue('--dot-future').trim() || '#111';
    colors.past = style.getPropertyValue('--dot-past').trim() || '#0b5aa2';
    colors.today = style.getPropertyValue('--dot-today').trim() || '#e8412c';
  }

  function utc(y, m, d) { return Date.UTC(y, m, d); }

  function todayUTC() {
    var now = new Date();
    return utc(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    var t = utc(+m[1], +m[2] - 1, +m[3]);
    return isNaN(t) ? null : t;
  }

  function fmt(n) { return n.toLocaleString('en-US'); }

  function fmtDate(t) {
    return new Date(t).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
    });
  }

  // Each life-year runs from one birthday to the next, so it holds 365 or 366
  // days. Without a birth date, use a generic pattern with every 4th year a leap year.
  function buildYears() {
    yearStarts = [0];
    var b = dob === null ? null : new Date(dob);
    for (var y = 0; y < YEARS; y++) {
      var len;
      if (b) {
        len = (utc(b.getUTCFullYear() + y + 1, b.getUTCMonth(), b.getUTCDate()) -
               utc(b.getUTCFullYear() + y, b.getUTCMonth(), b.getUTCDate())) / DAY_MS;
      } else {
        len = y % 4 === 3 ? 366 : 365;
      }
      yearStarts.push(yearStarts[y] + len);
    }
    todayIndex = dob === null ? -1 : Math.round((todayUTC() - dob) / DAY_MS);
  }

  function totalDays() { return yearStarts[YEARS]; }

  function yearOf(day) {
    var lo = 0, hi = YEARS - 1;
    while (lo < hi) {
      var mid = (lo + hi + 1) >> 1;
      if (yearStarts[mid] <= day) lo = mid; else hi = mid - 1;
    }
    return lo;
  }

  function layout() {
    var width = chart.clientWidth;
    var col = width / COLS;
    var row = col * ROW_RATIO;
    var decades = YEARS / 10;
    var height = row * (YEARS * 2 + (decades - 1) * DECADE_GAP);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    geom = { col: col, row: row, r: Math.max(col * 0.3, 0.5) };
  }

  function position(day) {
    var y = yearOf(day);
    var d = day - yearStarts[y];
    var r = y * 2 + (d < ROW_A ? 0 : 1);
    var c = d < ROW_A ? d : d - ROW_A;
    var decade = Math.floor(r / ROWS_PER_DECADE);
    return {
      x: (c + 0.5) * geom.col,
      y: (r + 0.5 + decade * DECADE_GAP) * geom.row,
      year: y
    };
  }

  function dot(day, color, scale) {
    var p = position(day);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, geom.r * (scale || 1), 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBase() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.future;
    ctx.beginPath();
    for (var i = 0, n = totalDays(); i < n; i++) {
      var p = position(i);
      ctx.moveTo(p.x + geom.r, p.y);
      ctx.arc(p.x, p.y, geom.r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  function fillPast(from, to) {
    ctx.fillStyle = colors.past;
    ctx.beginPath();
    for (var i = from; i < to; i++) {
      var p = position(i);
      ctx.moveTo(p.x + geom.r, p.y);
      ctx.arc(p.x, p.y, geom.r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  function drawToday() {
    if (todayIndex < 0 || todayIndex >= totalDays()) return;
    dot(todayIndex, colors.today, 1.8);
    var p = position(todayIndex);
    var size = Math.max(geom.col * 3, 14);
    todayMark.style.width = todayMark.style.height = size + 'px';
    todayMark.style.left = p.x + 'px';
    todayMark.style.top = p.y + 'px';
    todayMark.hidden = false;
  }

  // Draws the chart; with animate, the past fills in as a quick sweep.
  function draw(animate) {
    cancelAnimationFrame(animFrame);
    todayMark.hidden = true;
    readColors();
    layout();
    drawBase();
    var end = Math.min(Math.max(todayIndex, 0), totalDays());
    if (!animate || end === 0) {
      fillPast(0, end);
      drawToday();
      return;
    }
    // Fill at a steady pace of one second per decade lived.
    var duration = end / 3652.5 * 1000, start = null, done = 0;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min((t - start) / duration, 1);
      var upTo = Math.round(end * k);
      fillPast(done, upTo);
      done = upTo;
      if (k < 1) animFrame = requestAnimationFrame(step);
      else drawToday();
    }
    animFrame = requestAnimationFrame(step);
  }

  function renderStats() {
    if (dob === null) {
      stats.innerHTML = 'Enter your date of birth to see where you are.';
      return;
    }
    var total = totalDays();
    if (todayIndex < 0) {
      stats.innerHTML = 'That date is in the future.';
      return;
    }
    var lived = todayIndex;
    var html = 'You have lived <strong>' + fmt(lived) + '</strong> days. ';
    if (lived < total) {
      var pct = (lived / total * 100).toFixed(1);
      html += 'Today is day <strong>' + fmt(lived + 1) + '</strong> of your life, ' +
        'and you are <strong>' + pct + '%</strong> of the way through 100 years. ' +
        'That leaves <strong>' + fmt(total - lived) + '</strong> days.';
    } else {
      html += 'That is every day of a 100-year life, and then some.';
    }
    stats.innerHTML = html;
  }

  function setDob(t, animate) {
    dob = t;
    buildYears();
    renderStats();
    clearBtn.hidden = dob === null;
    draw(animate);
  }

  function save(str) {
    try {
      if (str) localStorage.setItem(STORAGE_KEY, str);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    history.replaceState(null, '', str ? '#' + str : location.pathname + location.search);
  }

  function load() {
    var fromHash = location.hash.slice(1);
    if (parseDate(fromHash) !== null) return fromHash;
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (e) { return ''; }
  }

  // Hover / tap: find the day under the pointer.
  function dayAt(x, y) {
    var c = Math.floor(x / geom.col);
    var band = ROWS_PER_DECADE + DECADE_GAP;
    var rr = y / geom.row;
    var decade = Math.floor(rr / band);
    var within = Math.floor(rr - decade * band);
    if (c < 0 || c >= COLS || decade < 0 || within >= ROWS_PER_DECADE) return -1;
    var r = decade * ROWS_PER_DECADE + within;
    var year = r >> 1;
    if (year >= YEARS) return -1;
    var d = (r & 1) ? ROW_A + c : c;
    if (!(r & 1) && c >= ROW_A) return -1;
    if (d >= yearStarts[year + 1] - yearStarts[year]) return -1;
    return yearStarts[year] + d;
  }

  function showTip(e) {
    var rect = canvas.getBoundingClientRect();
    var day = dayAt(e.clientX - rect.left, e.clientY - rect.top);
    if (day < 0) { hideTip(); return; }
    var p = position(day);
    var lines = ['Day ' + fmt(day + 1) + ' · age ' + p.year];
    if (dob !== null) {
      var date = fmtDate(dob + day * DAY_MS);
      if (day === todayIndex) lines.push('Today, ' + date);
      else lines.push(date + (day < todayIndex ? '' : ' · in ' + fmt(day - todayIndex) + ' days'));
    }
    tip.innerHTML = lines.join('<br>');
    tip.hidden = false;
    var size = Math.max(geom.col * 1.6, 8);
    ring.style.width = ring.style.height = size + 'px';
    ring.style.left = p.x + 'px';
    ring.style.top = p.y + 'px';
    ring.hidden = false;
    var tx = Math.min(Math.max(p.x, tip.offsetWidth / 2), chart.clientWidth - tip.offsetWidth / 2);
    tip.style.left = tx + 'px';
    tip.style.top = (p.y - size) + 'px';
  }

  function hideTip() { tip.hidden = true; ring.hidden = true; }

  canvas.addEventListener('pointermove', showTip);
  canvas.addEventListener('pointerdown', showTip);
  canvas.addEventListener('pointerleave', hideTip);

  input.max = new Date(todayUTC()).toISOString().slice(0, 10);
  input.addEventListener('change', function () {
    var t = parseDate(input.value);
    if (t === null && input.value) return;
    save(t === null ? '' : input.value);
    setDob(t, true);
  });
  clearBtn.addEventListener('click', function () {
    input.value = '';
    save('');
    setDob(null, false);
  });

  // Redraw when the theme changes, from the toggle or from the system setting.
  new MutationObserver(function () { draw(false); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { draw(false); });

  var resizeTimer;
  var lastWidth = chart.clientWidth;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (chart.clientWidth === lastWidth) return;
      lastWidth = chart.clientWidth;
      hideTip();
      draw(false);
    }, 100);
  });

  var initial = load();
  input.value = initial;
  setDob(parseDate(initial), true);
})();
