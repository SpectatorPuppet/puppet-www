// Scroll choreography for the home page story (src/components/story).
// Every timeline is scrubbed (scrub: 1 = the animation trails the scrollbar by about 1 second).
// Track heights live in Story.astro; start/end below say where in each track a timeline runs.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HEADER = 66; // the sticky site header; stages stick just below it

export function start() {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('story-on');
  const mm = gsap.matchMedia();
  // If the visitor turns on reduced motion mid-visit, matchMedia reverts everything.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    hero();
    walkthrough();
    bento();
    statement();
    counters();
    return () => document.documentElement.classList.remove('story-on');
  });
  // Tracks changed height when .story-on went on; measure again.
  ScrollTrigger.refresh();
}

const q = <T extends Element = HTMLElement>(root: Element, sel: string) => root.querySelector(sel) as T;
const qa = <T extends Element = HTMLElement>(root: Element, sel: string) => Array.from(root.querySelectorAll(sel)) as T[];

/** Section 1. Runs from the top of the hero track hitting the header to its bottom leaving the screen. */
function hero() {
  const root = document.querySelector('[data-story="hero"]');
  if (!root) return;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: `top top+=${HEADER}`, end: 'bottom bottom', scrub: 1 },
  });
  // 0 → 0.45: copy drifts up and fades out.
  tl.to(q(root, '[data-beat="copy"]'), { yPercent: -60, opacity: 0, duration: 0.45 }, 0);
  tl.to(q(root, '[data-beat="hint"]'), { opacity: 0, duration: 0.1 }, 0);
  // 0 → 1: the portal goes from tilted back in 3D to flat and full width, rising into the space the copy left.
  tl.fromTo(
    q(root, '[data-beat="app"]'),
    { rotateX: 32, scale: 0.78, y: 0 },
    { rotateX: 0, scale: 1.12, y: () => -q(root, '[data-beat="copy"]').offsetHeight * 0.95, duration: 1 },
    0,
  );
}

/** Section 2. Three beats across the 300vh track: 0–33%, 33–66%, 66–100%. */
function walkthrough() {
  const root = document.querySelector('[data-story="walk"]');
  if (!root) return;
  const board = q(root, '#walk-board');
  const steps = qa(root, '[data-beat="step"]');
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: root, start: `top top+=${HEADER}`, end: 'bottom bottom', scrub: 1 },
  });
  // The timeline is 3 units long, one per beat, so labels line up with the thirds of the track.
  tl.to(q(root, '[data-beat="prog"]'), { scaleX: 1, ease: 'none', duration: 3 }, 0);

  // Beat 1 (0–1): zoom into the installed apps and pop out the one-sign-in card.
  tl.addLabel('b1', 0)
    .to(q(board, '[data-beat="main"]'), { scale: 1.18, duration: 0.4 }, 'b1+=0.05')
    .to(q(board, '[data-beat="focus-tile"]'), { outlineColor: '#e10600', duration: 0.2 }, 'b1+=0.2')
    .fromTo(q(board, '[data-beat="tests"]'), { autoAlpha: 0, y: 30, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35 }, 'b1+=0.3');

  // Beat 2 (1–2): swap callout, un-zoom, slide in the AI and usage panel and fill its bars.
  tl.addLabel('b2', 1)
    .to(steps[0], { autoAlpha: 0, y: -20, duration: 0.2 }, 'b2')
    .fromTo(steps[1], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 'b2+=0.15')
    .to(q(board, '[data-beat="tests"]'), { autoAlpha: 0, y: -20, duration: 0.2 }, 'b2')
    .to(q(board, '[data-beat="main"]'), { scale: 1, duration: 0.3 }, 'b2')
    .fromTo(q(board, '[data-beat="panel"]'), { autoAlpha: 1, xPercent: 105 }, { xPercent: 0, duration: 0.35 }, 'b2+=0.15')
    .fromTo(qa(board, '[data-beat="bar"]'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', stagger: 0.08, duration: 0.3 }, 'b2+=0.45');

  // Beat 3 (2–3): panel leaves, the invite modal expands, then its badge flips to joined.
  tl.addLabel('b3', 2)
    .to(steps[1], { autoAlpha: 0, y: -20, duration: 0.2 }, 'b3')
    .fromTo(steps[2], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 'b3+=0.15')
    .to(q(board, '[data-beat="panel"]'), { xPercent: 105, duration: 0.3 }, 'b3')
    .fromTo(q(board, '[data-beat="modal"]'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35 }, 'b3+=0.2')
    .to(q(board, '.badge .was'), { autoAlpha: 0, duration: 0.15 }, 'b3+=0.7')
    .to(q(board, '.badge .now'), { opacity: 1, scale: 1.06, duration: 0.15 }, 'b3+=0.7')
    .to({}, { duration: 0.15 }); // a short hold at the end before the stage unsticks
}

/** Section 3. Each [data-speed] moves at its own rate while the grid crosses the viewport. */
function bento() {
  const root = document.querySelector('[data-story="bento"]');
  if (!root) return;
  // Smaller drift on narrow screens, where tiles stack and would collide.
  const range = matchMedia('(max-width: 900px)').matches ? 24 : 80;
  for (const el of qa(root, '[data-speed]')) {
    const speed = Number(el.dataset.speed);
    gsap.fromTo(
      el,
      { y: () => speed * range },
      { y: () => -speed * range, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } },
    );
  }
}

/** Section 4a. Words go from 0.2 to 1 opacity in reading order across the 200vh text track. */
function statement() {
  const track = document.querySelector('.t-say');
  if (!track) return;
  gsap.fromTo(
    qa(track, '[data-beat="word"]'),
    { opacity: 0.2 },
    { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: track, start: `top top+=${HEADER}`, end: 'bottom bottom', scrub: 1 } },
  );
}

/** Section 4b. Counters count up once when 85% down the viewport. Not scrubbed: numbers should land. */
function counters() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const to = Number(el.dataset.count);
    const n = { v: 0 };
    el.textContent = '0';
    gsap.to(n, {
      v: to, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(n.v)); },
    });
  }
}
