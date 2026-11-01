// Small view helpers shared by the profile drawer, the header chip, the home teaser and the game:
// the pixel avatar, badge icons, text formatting and a short confetti burst.
import {RULES, type BadgeId, type State} from './visitor';
import {ICONS} from './icons';
export {ICONS};

/** `{n}`-style placeholders. */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export const num = (n: number, lang: string) => n.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US');

/** A 5×5 mirrored pixel avatar seeded by the profile id, in the Tryino pixel style. */
export function avatarSvg(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2 ** 32;
  const palettes = [
    ['#00A4E4', '#4F46E5'],
    ['#4F46E5', '#7C6CF2'],
    ['#00A4E4', '#2FBF8F'],
    ['#FFB547', '#FF7A59'],
    ['#7C6CF2', '#00A4E4'],
  ];
  const [a, b] = palettes[Math.floor(rand() * palettes.length)];
  let cells = '';
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 3; x++) {
      if (rand() < 0.45) continue;
      const fill = rand() < 0.5 ? a : b;
      cells += `<rect x="${x * 6 + 1}" y="${y * 6 + 1}" width="5" height="5" rx="1" fill="${fill}"/>`;
      if (x < 2) cells += `<rect x="${(4 - x) * 6 + 1}" y="${y * 6 + 1}" width="5" height="5" rx="1" fill="${fill}"/>`;
    }
  return `<svg viewBox="0 0 31 31" aria-hidden="true">${cells}</svg>`;
}

export const icon = (name: keyof typeof ICONS) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/** A short confetti burst from a point (or the top centre). Skipped when the visitor prefers reduced motion. */
export function confetti(x = innerWidth / 2, y = innerHeight * 0.3) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:200';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const colors = ['#00A4E4', '#4F46E5', '#FFB547', '#2FBF8F', '#7C6CF2', '#FF7A59'];
  const parts = Array.from({length: 140}, () => {
    const a = Math.random() * Math.PI * 2;
    const v = 4 + Math.random() * 9;
    return {x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, s: 4 + Math.random() * 6, r: Math.random() * 6, c: colors[(Math.random() * colors.length) | 0]};
  });
  const t0 = performance.now();
  const frame = (t: number) => {
    const k = (t - t0) / 1800;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += 0.1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    }
    if (k < 1) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

/** Opens the profile drawer (rendered once per page by VisitorProfile.astro). */
export const openProfile = (tab?: string) => document.dispatchEvent(new CustomEvent('visitor:open', {detail: tab}));

export type LinkedInLinks = {linkedin: string; product: string; share: string};
type LinkedInCopy = {quests: Record<string, string>; badges: Record<string, readonly string[]>; shareLinkedIn: string};

/** The next LinkedIn step for the end of a game: follow Tryino, then visit the Ino Loyalty product page (once it exists),
 * then share a badge. One button at a time; nothing once all are done or without a profile. */
export function linkedinStep(s: State | null, links: LinkedInLinks, c: LinkedInCopy, badge?: BadgeId) {
  if (!s) return '';
  const done = (k: string) => s.done.includes(k);
  const button = (href: string, ext: string, label: string, xp: number) =>
    `<a class="li-next" href="${href}" target="_blank" rel="noopener" data-ext="${ext}">${icon('linkedin')}<span>${label}</span><em>+${xp} XP</em></a>`;
  if (!done('linkedin')) return button(links.linkedin, 'linkedin', c.quests.linkedin, RULES.linkedin);
  if (links.product && !done('linkedinProduct')) return button(links.product, 'linkedinProduct', c.quests.linkedinProduct, RULES.linkedinProduct);
  const earned = badge && s.badges.some((b) => b.id === badge) ? badge : s.badges.at(-1)?.id;
  if (earned && !done('share')) {
    const url = `${links.share}${earned}?utm_source=linkedin&utm_medium=social&utm_campaign=game`;
    return button(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, `share:${earned}`, `${c.shareLinkedIn}: ${c.badges[earned][0]}`, RULES.share);
  }
  return '';
}

/** Sends an event to Google Analytics, which is only loaded after the visitor allows analytics cookies
 * (CookieConsent.astro). Without consent this does nothing. Never pass personal data or coupon codes. */
export function analytics(name: string, params: Record<string, string | number> = {}) {
  const gtag = (window as unknown as {gtag?: (...a: unknown[]) => void}).gtag;
  gtag?.('event', name, params);
}
