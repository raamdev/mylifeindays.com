<div class="life">
  <h1 class="life-title">All the Days in a 100-Year Human Life</h1>
  <p class="life-subtitle">(2 rows = 1 year, each section = 1 decade)</p>
  <form class="life-form" onsubmit="return false">
    <label for="life-dob">Your date of birth</label>
    <input type="date" id="life-dob" min="1900-01-01">
    <button type="button" id="life-clear" hidden>Clear</button>
  </form>
  <p class="life-stats" id="life-stats" aria-live="polite"></p>
  <div class="life-chart" id="life-chart">
    <canvas role="img" aria-label="A grid of dots, one for each day in a 100-year life"></canvas>
    <div class="life-today" id="life-today" hidden></div>
    <div class="life-ring" id="life-ring" hidden></div>
    <div class="life-tip" id="life-tip" hidden></div>
  </div>
  <p class="life-credit">Inspired by <a href="https://waitbutwhy.com/2014/05/life-weeks.html">waitbutwhy.com</a></p>
</div>
<script src="assets/js/life.js" defer></script>

We experience life in days, not hours, weeks, months, or years.

Each day is a story, a miniature version of a human life: it contains a beginning, a middle, and an end.

Each day is an opportunity to rewrite, an opportunity to start telling a new story. 

Or if we're already building a great story, it's an opportunity to build upon the previous chapter, to do something surprising.

Life is short, yes, but it's also full of unscripted potential.

[Yuri Gagarin](https://en.wikipedia.org/wiki/Yuri_Gagarin), over the course of 20 years, went from living in a mud hut to becoming the first human to journey to outer space.

What else is possible?

## 1% of 1 day

If it's too overwhelming to think of all the days in your life, how about just 1% of one day?

15 minutes = 1% of a day.

<div class="day">
  <p class="day-title">One day = 96 blocks of 15 minutes</p>
  <div class="day-grid" id="day-grid" role="img" aria-label="96 dots, one for every 15 minutes in a day, with 32 of them marking 8 hours of sleep"></div>
  <div class="day-legend">
    <span><i class="day-dot is-sleep"></i> 8 hours asleep</span>
    <span><i class="day-dot is-on"></i> Your time</span>
  </div>
  <div class="day-options" id="day-options" role="group" aria-label="Time per day">
    <button type="button" data-minutes="15">15 min</button>
    <button type="button" data-minutes="30">30 min</button>
    <button type="button" data-minutes="45">45 min</button>
    <button type="button" data-minutes="60">1 hour</button>
  </div>
  <p class="day-stats" id="day-stats" aria-live="polite"></p>
</div>
<script src="assets/js/day.js" defer></script>

What could you do for 15 minutes every day for the next year that would make your life better?

One percent. Can you dedicate one percent to that activity?

- 30 minutes = 2% of a day.
- 45 minutes = 3% of a day.
- 1 hour = 4% of a day.

You probably spend 30% of each day sleeping.

What are you doing with the other 70%?

## Who made this?

Hey there! My name is [Raam Dev](https://raamdev.com/about/). 

By day I make the web a better place as a software engineer at [Automattic](https://automattic.com/). 

By night I write on [raamdev.com](https://raamdev.com/). Say hello to [@raamdev](https://twitter.com/raamdev).
