// Motion and working demos for /products/tasks. All demos run on sample data in the page; nothing
// leaves the browser. The page is complete without this script: it only adds motion and unhides
// the demo buttons. Scroll motion respects prefers-reduced-motion; the demos work either way.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T;
const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as T[];
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function start() {
  gsap.registerPlugin(ScrollTrigger, Flip);
  // Demo controls ship hidden so a page without JavaScript shows no dead buttons.
  for (const el of $$(document, '[data-act],[data-tk$="picks"],[data-tk="calc"]')) el.hidden = false;
  tabs();
  voice();
  gate();
  ask();
  calculator();
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    heroIn();
    reveals();
    const stop = boardLoop();
    return stop;
  });
}

/** Hero: headline words rise in, the board tilts up from 3D, the floating badges bob. */
function heroIn() {
  const root = document.querySelector('[data-tk="hero"]');
  if (!root) return;
  const h1 = $(root, '[data-tk="split"]');
  // Build word spans as text nodes: the headline can come from an app's manifest.
  const words = h1.textContent!.trim().split(/\s+/);
  h1.replaceChildren(...words.flatMap((w, i) => {
    const span = Object.assign(document.createElement('span'), { textContent: w });
    span.style.display = 'inline-block';
    return i ? [' ', span] : [span];
  }));
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from($$(h1, 'span'), { yPercent: 60, opacity: 0, stagger: 0.06, duration: 0.7 })
    .from($$(root, '.tk-pill,.tk-intro,.row,.trust'), { y: 16, opacity: 0, stagger: 0.08, duration: 0.5 }, 0.2)
    .from($(root, '[data-tk="board"]'), { rotateX: 18, y: 40, opacity: 0, duration: 1 }, 0.1)
    .from($$(root, '[data-tk="float"]'), { scale: 0.6, opacity: 0, stagger: 0.15, duration: 0.5, ease: 'back.out(2)' }, 0.7);
  $$(root, '[data-tk="float"]').forEach((el, i) => gsap.to(el, { y: i ? 8 : -8, duration: 2.4 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.4 }));
  // While the hero scrolls away, the board flattens and drifts up a little.
  gsap.to($(root, '[data-tk="board"]'), { rotateX: -6, y: -40, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 1 } });
}

/** Hero board: every few seconds one card moves a column to the right, then the board resets. */
function boardLoop() {
  const board = document.querySelector<HTMLElement>('[data-tk="board"]');
  if (!board) return;
  const col = (c: string) => $(board, `[data-col="${c}"]`);
  const counts = () => $$(board, '.tk-col').forEach((c) => ($(c, '[data-count-col]').textContent = String($$(c, '[data-card]').length)));
  const initial = $$(board, '.tk-col').map((c) => $$(c, '[data-card]'));
  const moves: [string, string][] = [['doing', 'done'], ['todo', 'doing'], ['doing', 'done'], ['todo', 'doing']];
  let step = 0;
  let paused = false;
  counts();
  board.addEventListener('mouseenter', () => (paused = true));
  board.addEventListener('mouseleave', () => (paused = false));
  const move = () => {
    if (paused || document.hidden) return;
    const state = Flip.getState($$(board, '[data-card]'));
    if (step === moves.length) {
      // Back to the start, so the story loops.
      $$(board, '.tk-col').forEach((c, i) => initial[i].forEach((card) => c.appendChild(card)));
      step = 0;
    } else {
      const [from, to] = moves[step++];
      const card = $(col(from), '[data-card]');
      if (card) col(to).insertBefore(card, $(col(to), '[data-card]'));
    }
    counts();
    Flip.from(state, { duration: 0.7, ease: 'power2.inOut', absolute: true });
  };
  const id = setInterval(move, 2600);
  return () => clearInterval(id);
}

/** Headings and card grids fade up as they enter. */
function reveals() {
  for (const el of $$(document, '[data-tk="reveal"]'))
    gsap.from(el, { y: 24, opacity: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  for (const el of $$(document, '[data-tk="stagger"]'))
    gsap.from($$(el, '.c'), { y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
}

/** Views: an accessible tablist (arrow keys, Home/End) with a sliding indicator. */
function tabs() {
  const list = document.querySelector<HTMLElement>('[data-tk="tabs"]');
  if (!list) return;
  const btns = $$<HTMLButtonElement>(list, '[role="tab"]');
  const ind = $(list, '.tk-ind');
  const place = (b: HTMLElement) => { ind.style.width = `${b.offsetWidth}px`; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  const select = (b: HTMLButtonElement, focus = false) => {
    for (const x of btns) {
      const on = x === b;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(x.getAttribute('aria-controls')!)!;
      panel.hidden = !on;
      if (on && !reduce()) gsap.fromTo($$(panel, '.tk-card,tr'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.35, overwrite: true });
    }
    if (focus) b.focus();
    place(b);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(b));
    b.addEventListener('keydown', (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select(btns[(n + btns.length) % btns.length], true);
    });
  });
  place(btns[0]);
  addEventListener('resize', () => place(btns.find((b) => b.tabIndex === 0)!));
}

type Voice = { say: string; title: string; crit: string[] };
/** Voice to ticket: "listen", type the transcript, then draft the ticket and its criteria. */
function voice() {
  const root = document.querySelector<HTMLElement>('[data-tk="voice"]');
  if (!root) return;
  const voices = JSON.parse(root.dataset.voices!) as Voice[];
  const picks = $$<HTMLButtonElement>(document, '[data-tk="voice-picks"] button');
  const speak = $<HTMLButtonElement>(root, '[data-act="speak"]');
  const mic = $(root, '.tk-mic');
  const out = (k: string) => $(root, `[data-out="${k}"]`);
  let current = 0;
  let run = 0;
  const play = async () => {
    const me = ++run;
    const v = voices[current];
    const fast = reduce();
    speak.disabled = true;
    mic.classList.add('on');
    out('state').textContent = 'Listening…';
    out('ticket').style.opacity = '0.25';
    out('say').textContent = '';
    for (const w of v.say.split(' ')) {
      if (me !== run) return;
      out('say').textContent += (out('say').textContent ? ' ' : '') + w;
      if (!fast) await wait(70);
    }
    mic.classList.remove('on');
    out('state').textContent = 'Transcribed · audio deleted';
    if (!fast) await wait(350);
    if (me !== run) return;
    out('title').textContent = v.title;
    out('crit').replaceChildren(...v.crit.map((c) => Object.assign(document.createElement('li'), { textContent: c })));
    out('ticket').style.opacity = '1';
    if (!fast) gsap.from([out('title'), ...$$(out('crit'), 'li')], { x: -12, opacity: 0, stagger: 0.12, duration: 0.4 });
    speak.disabled = false;
  };
  speak.addEventListener('click', play);
  picks.forEach((b, i) => b.addEventListener('click', () => {
    picks.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    current = i;
    play();
  }));
}

/** Done gate: Done is refused (409-style) until "Run CI" turns every criterion green. */
function gate() {
  const root = document.querySelector<HTMLElement>('[data-tk="gate"]');
  if (!root) return;
  const crits = $$(root, '[data-crit]');
  const msg = $(root, '[data-out="msg"]');
  const [ci, done, reset] = ['ci', 'done', 'reset'].map((a) => $<HTMLButtonElement>(root, `[data-act="${a}"]`));
  const say = (text: string, kind = '') => { msg.textContent = text; msg.className = `tk-msg ${kind}`; };
  const fresh = () => {
    crits.forEach((c, i) => { c.className = i === 0 ? '' : 'no'; $(c, 'em').textContent = i === 0 ? 'passing' : 'no test yet'; });
    ci.disabled = false; done.disabled = false;
    say('1 of 3 criteria has a passing test. Try moving it to Done.');
  };
  fresh();
  ci.addEventListener('click', async () => {
    ci.disabled = true;
    for (const c of crits.filter((x) => x.classList.contains('no'))) {
      c.className = 'run'; $(c, 'em').textContent = 'running';
      await wait(reduce() ? 0 : 700);
      c.className = ''; $(c, 'em').textContent = 'passing';
    }
    say('CI posted results: 3 of 3 criteria passing.', 'ok');
  });
  done.addEventListener('click', () => {
    const missing = crits.filter((c) => c.className !== '').length;
    if (missing) {
      say(`Blocked: ${missing} criteria have no passing test (acceptance_not_verified). Run CI first.`, 'err');
      if (!reduce()) { root.classList.remove('tk-shake'); void root.offsetWidth; root.classList.add('tk-shake'); }
      return;
    }
    done.disabled = true;
    say('Moved to Done. A proof-of-delivery report is ready for the client.', 'ok');
    if (!reduce()) gsap.fromTo(crits, { scale: 1 }, { scale: 1.02, yoyo: true, repeat: 1, stagger: 0.06, duration: 0.15 });
  });
  reset.addEventListener('click', fresh);
}

type Ask = { q: string; a: string; refs: string[] };
/** Ask your board: pick a question, the answer streams in with the tickets it came from. */
function ask() {
  const root = document.querySelector<HTMLElement>('[data-tk="ask"]');
  if (!root) return;
  const asks = JSON.parse(root.dataset.asks!) as Ask[];
  const out = (k: string) => $(root, `[data-out="${k}"]`);
  let run = 0;
  $$<HTMLButtonElement>(root, '[data-tk="ask-picks"] button').forEach((b, i, all) => b.addEventListener('click', async () => {
    all.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const me = ++run;
    const a = asks[i];
    out('q').textContent = a.q;
    out('refs').replaceChildren();
    out('a').textContent = '…';
    if (!reduce()) await wait(400);
    out('a').textContent = '';
    for (const w of a.a.split(' ')) {
      if (me !== run) return;
      out('a').textContent += (out('a').textContent ? ' ' : '') + w;
      if (!reduce()) await wait(35);
    }
    out('refs').replaceChildren(...a.refs.map((r) => Object.assign(document.createElement('span'), { textContent: r })));
  }));
}

/** Pricing: currency switch and a team-size slider that shows the monthly total per plan. */
function calculator() {
  const root = document.querySelector<HTMLElement>('[data-tk="price"]');
  if (!root) return;
  const data = JSON.parse(root.dataset.prices!) as { currencies: { code: string; symbol: string }[]; plans: Record<string, number>[]; min: number };
  const range = $<HTMLInputElement>(root, '[data-in="seats"]');
  const curs = $$<HTMLButtonElement>(root, '[data-cur]');
  let cur = 0;
  const fmt = (n: number) => {
    const c = data.currencies[cur];
    return `${c.symbol}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)}`;
  };
  const render = () => {
    const seats = Math.max(data.min, Number(range.value));
    $(root, '[data-out="seats"]').textContent = String(seats);
    data.plans.forEach((prices, i) => {
      const unit = prices[data.currencies[cur].code];
      $(root, `[data-out="price-${i}"]`).textContent = fmt(unit);
      $(root, `[data-out="total-${i}"]`).textContent = `${fmt(unit * seats)} a month for ${seats} users`;
    });
  };
  range.addEventListener('input', render);
  curs.forEach((b, i) => b.addEventListener('click', () => {
    cur = i;
    curs.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    render();
    if (!reduce()) gsap.from($$(root, '[data-out^="price-"]'), { y: -8, opacity: 0, stagger: 0.05, duration: 0.3 });
  }));
  render();
}
