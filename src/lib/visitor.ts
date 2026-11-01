// Anonymous visitor loyalty program: XP and levels (status), points (wallet), badges, quests, a daily streak, two daily
// chance games (a scratch card, then the wheel) and one reward, the Ino Loyalty coupon. Rewards are kept small and
// capped per day, so the coupon takes a few visits rather than a few clicks. It runs entirely in the browser: the profile is created only when the visitor starts
// it, lives in localStorage under `tryino-visitor`, and is never sent anywhere. Reset removes it.

export const KEY = 'tryino-visitor';

export const LEVELS = [
  {id: 'visitor', xp: 0},
  {id: 'explorer', xp: 200},
  {id: 'expert', xp: 500},
  {id: 'champion', xp: 1000},
] as const;
export type LevelId = (typeof LEVELS)[number]['id'];

export const TOUR = ['ino', 'features', 'integrations', 'developers'] as const;
export const BADGES = ['first-step', 'explorer', 'builder', 'player', 'sharpshooter', 'streak3', 'lucky', 'connector', 'ambassador', 'deal'] as const;
export type BadgeId = (typeof BADGES)[number];
export type Reason = 'welcome' | 'page' | 'tour' | 'video' | 'apiReference' | 'daily' | 'streak' | 'game' | 'coupon' | 'demo' | 'linkedin' | 'linkedinProduct' | 'share' | 'scratch' | 'wheel';

export const RULES = {
  welcome: 10,
  page: 10,
  tourBonus: 20,
  video: 15,
  apiReference: 10,
  demo: 30,
  linkedin: 100, // the main reward: following Tryino on LinkedIn (also required for the coupon)
  linkedinProduct: 60,
  share: 80,
  daily: 5,
  streakBonus: 20,
  gameDivisor: 20, // Points Rush: score / 20
  gamePerRound: 60,
  gamePerDay: 120,
  sharpshooter: 1000, // game score for the badge
  lucky: 50, // a chance-game prize of at least this wins the badge
};

/** Scratch card prizes (XP and points) with their weights: always something, rarely much. */
export const SCRATCH = [
  {prize: 5, weight: 35},
  {prize: 10, weight: 30},
  {prize: 15, weight: 18},
  {prize: 25, weight: 10},
  {prize: 50, weight: 6},
  {prize: 100, weight: 1},
];
/** Wheel segments clockwise from the top, and how likely each one is. */
export const WHEEL = [
  {prize: 5, weight: 22},
  {prize: 20, weight: 14},
  {prize: 10, weight: 14},
  {prize: 50, weight: 6},
  {prize: 15, weight: 18},
  {prize: 30, weight: 10},
  {prize: 10, weight: 14},
  {prize: 100, weight: 2},
];
export const COUPON = {cost: 300, level: 'explorer' as LevelId, days: 90, linkedin: true};

export type State = {
  v: 1;
  id: string; // random; only seeds the avatar
  created: string;
  xp: number;
  points: number;
  done: string[]; // one-time quests: welcome, page:<key>, tour, video, apiReference, streak3
  badges: {id: BadgeId; at: string}[];
  streak: {count: number; last: string}; // last = local date YYYY-MM-DD
  game: {plays: number; best: number; day: string; earnedToday: number};
  coupon?: {code: string; at: string; expires: string};
  // Today's chance games. The prize is decided (and saved) when the card is picked or the wheel starts, so reloading
  // can't re-roll it; it is credited when the card is scratched or the wheel stops.
  chance?: {day: string; scratch?: {card: number; prize: number; others: number[]; claimed: boolean}; wheel?: {segment: number; prize: number; claimed: boolean}};
  history: {at: string; reason: Reason; detail?: string; xp: number; points: number}[];
};

export type Award = {
  reason: Reason;
  detail?: string;
  xp: number;
  points: number;
  badges: BadgeId[];
  levelUp?: LevelId;
};

const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
};
const randomId = (n: number, alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789') => {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
};

const browser = typeof window !== 'undefined';
let state: State | null = browser ? read() : null;

function read(): State | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    return s && s.v === 1 ? s : null;
  } catch {
    return null;
  }
}
function write() {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode or storage full: the profile still works for this page view.
  }
  emit('visitor:change', state);
}
function emit(name: string, detail: unknown) {
  document.dispatchEvent(new CustomEvent(name, {detail}));
}

export const get = () => state;
export const isStarted = () => state !== null;

export function levelFor(xp: number) {
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.xp) index = i;
  });
  const level = LEVELS[index];
  const next = LEVELS[index + 1];
  return {
    id: level.id,
    index,
    next: next?.id,
    toNext: next ? next.xp - xp : 0,
    progress: next ? (xp - level.xp) / (next.xp - level.xp) : 1,
  };
}

/** Adds XP, points and badges in one step, records it in the history and announces it. */
function give(reason: Reason, xp: number, points: number, badges: BadgeId[] = [], detail?: string): Award | null {
  if (!state) return null;
  const before = levelFor(state.xp).id;
  const at = new Date().toISOString();
  state.xp += xp;
  state.points += points;
  const fresh = badges.filter((b) => !state!.badges.some((x) => x.id === b));
  fresh.forEach((id) => state!.badges.push({id, at}));
  if (xp || points) state.history = [{at, reason, detail, xp, points}, ...state.history].slice(0, 30);
  const after = levelFor(state.xp).id;
  const award: Award = {reason, detail, xp, points, badges: fresh, levelUp: after !== before ? after : undefined};
  write();
  emit('visitor:award', award);
  return award;
}

function once(key: string, fn: () => void) {
  if (!state || state.done.includes(key)) return;
  state.done.push(key);
  fn();
}

function checkIn() {
  if (!state) return;
  const d = today();
  if (state.streak.last === d) return;
  const continued = state.streak.last === yesterday();
  state.streak = {count: continued ? state.streak.count + 1 : 1, last: d};
  give('daily', RULES.daily, RULES.daily, [], String(state.streak.count));
  if (state.streak.count >= 3) once('streak3', () => give('streak', RULES.streakBonus, RULES.streakBonus, ['streak3']));
}

export function start(page?: string) {
  if (state) return state;
  state = {
    v: 1,
    id: randomId(8),
    created: new Date().toISOString(),
    xp: 0,
    points: 0,
    done: ['welcome'],
    badges: [],
    streak: {count: 1, last: today()},
    game: {plays: 0, best: 0, day: today(), earnedToday: 0},
    history: [],
  };
  give('welcome', RULES.welcome, RULES.welcome, ['first-step']);
  if (page) track(`page:${page}`);
  return state;
}

/** Called on every page view and for things the visitor does (`page:<route key>`, `video`, `demo`, `linkedin`,
 * `linkedinProduct`, `share`). The LinkedIn steps can't be verified (LinkedIn offers no such check), so they are
 * honour-based and kept small. */
export function track(action: string) {
  if (!state) return;
  checkIn();
  const [kind, key] = action.split(':');
  if (kind === 'page' && (TOUR as readonly string[]).includes(key)) {
    once(`page:${key}`, () => give('page', RULES.page, RULES.page, [], key));
    if (TOUR.every((t) => state!.done.includes(`page:${t}`)))
      once('tour', () => give('tour', RULES.tourBonus, RULES.tourBonus, ['explorer']));
  }
  if (kind === 'page' && key === 'apiReference')
    once('apiReference', () => give('apiReference', RULES.apiReference, RULES.apiReference, ['builder']));
  if (kind === 'video') once('video', () => give('video', RULES.video, RULES.video));
  if (kind === 'demo') once('demo', () => give('demo', RULES.demo, RULES.demo));
  if (kind === 'linkedin') once('linkedin', () => give('linkedin', RULES.linkedin, RULES.linkedin, ['connector']));
  if (kind === 'linkedinProduct') once('linkedinProduct', () => give('linkedinProduct', RULES.linkedinProduct, RULES.linkedinProduct));
  if (kind === 'share') once('share', () => give('share', RULES.share, RULES.share, ['ambassador'], key));
}

/** Points for a Points Rush round: score / 20, at most 60 a round and 120 a day. */
export function gamePoints(score: number, s: State | null = state) {
  const earnedToday = s && s.game.day === today() ? s.game.earnedToday : 0;
  return Math.max(0, Math.min(Math.floor(score / RULES.gameDivisor), RULES.gamePerRound, RULES.gamePerDay - earnedToday));
}

export function recordGame(score: number) {
  if (!state) return null;
  if (state.game.day !== today()) state.game = {...state.game, day: today(), earnedToday: 0};
  const pts = gamePoints(score);
  state.game.plays += 1;
  state.game.best = Math.max(state.game.best, score);
  state.game.earnedToday += pts;
  const badges: BadgeId[] = ['player'];
  if (score >= RULES.sharpshooter) badges.push('sharpshooter');
  return give('game', pts, pts, badges, String(score));
}

// Chance games: one scratch card a day, then one spin of the wheel.
const pick = <T extends {weight: number}>(items: T[]) => {
  const total = items.reduce((n, i) => n + i.weight, 0);
  let r = (crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * total;
  for (let i = 0; i < items.length; i++) if ((r -= items[i].weight) < 0) return i;
  return items.length - 1;
};
const chanceToday = () => {
  if (!state) return null;
  if (state.chance?.day !== today()) state.chance = {day: today()};
  return state.chance;
};
export const chance = () => (state?.chance?.day === today() ? state.chance : {day: today()});

/** Picks one of the three face-down cards. The prize is fixed now; the other two cards show what they held. */
export function pickScratch(card: number) {
  const c = chanceToday();
  if (!c) return null;
  if (!c.scratch) {
    const draw = () => SCRATCH[pick(SCRATCH)].prize;
    c.scratch = {card, prize: draw(), others: [draw(), draw()], claimed: false};
    write();
  }
  return c.scratch;
}
export function claimScratch() {
  const c = chanceToday();
  if (!c?.scratch || c.scratch.claimed) return null;
  c.scratch.claimed = true;
  const p = c.scratch.prize;
  return give('scratch', p, p, p >= RULES.lucky ? ['lucky'] : [], String(p));
}

/** Starts a spin (only after today's scratch card). Returns the winning segment for the animation. */
export function spinWheel() {
  const c = chanceToday();
  if (!c?.scratch?.claimed) return null;
  if (!c.wheel) {
    const segment = pick(WHEEL);
    c.wheel = {segment, prize: WHEEL[segment].prize, claimed: false};
    write();
  }
  return c.wheel;
}
export function claimWheel() {
  const c = chanceToday();
  if (!c?.wheel || c.wheel.claimed) return null;
  c.wheel.claimed = true;
  const p = c.wheel.prize;
  return give('wheel', p, p, p >= RULES.lucky ? ['lucky'] : [], String(p));
}

export type RedeemResult = {ok: true; coupon: NonNullable<State['coupon']>} | {ok: false; why: 'level' | 'points' | 'linkedin'};

export function redeemCoupon(): RedeemResult {
  if (!state) return {ok: false, why: 'level'};
  if (state.coupon) return {ok: true, coupon: state.coupon};
  if (levelFor(state.xp).index < LEVELS.findIndex((l) => l.id === COUPON.level)) return {ok: false, why: 'level'};
  if (state.points < COUPON.cost) return {ok: false, why: 'points'};
  if (COUPON.linkedin && !state.done.includes('linkedin')) return {ok: false, why: 'linkedin'};
  const at = new Date();
  const expires = new Date(at.getTime() + COUPON.days * 864e5);
  state.coupon = {code: `INOPOC-${randomId(4)}-${randomId(4)}`, at: at.toISOString(), expires: expires.toISOString()};
  give('coupon', 0, -COUPON.cost, ['deal']);
  return {ok: true, coupon: state.coupon};
}

export function reset() {
  state = null;
  write();
}

// Keep tabs in step: a change in another tab updates this one.
if (browser)
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = read();
    emit('visitor:change', state);
  });
