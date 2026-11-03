(function () {
  'use strict';

  var BLOCK = 15;          // minutes per dot
  var HOURS = 24;
  var SLEEP_HOURS = 8;     // the first dots show a typical night's sleep
  var DAYS_PER_YEAR = 365.25;

  var grid = document.getElementById('day-grid');
  if (!grid) return;
  var stats = document.getElementById('day-stats');
  var buttons = document.querySelectorAll('#day-options button');

  function fmt(n, digits) {
    return n.toLocaleString('en-US', { maximumFractionDigits: digits || 0 });
  }

  function plural(n, word) { return fmt(n) + '\u00a0' + word + (Math.round(n) === 1 ? '' : 's'); }

  // One dot per 15 minutes; the grid flows by column, so each column is an hour.
  var asleep = SLEEP_HOURS * 60 / BLOCK;
  var dots = [];
  for (var i = 0; i < HOURS * 60 / BLOCK; i++) {
    var dot = document.createElement('span');
    dot.className = 'day-dot' + (i < asleep ? ' is-sleep' : '');
    grid.appendChild(dot);
    dots.push(dot);
  }

  function select(minutes) {
    var count = minutes / BLOCK;
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-on', i >= asleep && i < asleep + count);
    });
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('aria-pressed', String(+b.dataset.minutes === minutes));
    });

    var label = minutes === 60 ? '1 hour' : minutes + ' minutes';
    var pct = Math.round(minutes / (24 * 60) * 100);
    var hoursPerYear = minutes * DAYS_PER_YEAR / 60;
    stats.innerHTML =
      '<strong>' + label + '</strong> is <strong>' + pct + '%</strong> of a day. ' +
      'Every day for a year, that adds up to <strong>' + plural(hoursPerYear, 'hour') + '</strong>, ' +
      'or <strong>' + fmt(hoursPerYear / 24, 1) + '\u00a0full days</strong>. ' +
      'Over ten years, it\u2019s <strong>' + plural(hoursPerYear * 10 / 24, 'day') + '</strong>.';
  }

  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener('click', function () { select(+b.dataset.minutes); });
  });

  select(BLOCK);
})();
