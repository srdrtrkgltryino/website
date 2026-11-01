// Line icons for badges and the visitor program UI (24×24, stroke = currentColor). Only a type import, so build
// scripts can load this file directly.
import type {BadgeId} from './visitor';

export const ICONS: Record<BadgeId | 'plus' | 'level' | 'coin' | 'lock' | 'check' | 'linkedin' | 'share', string> = {
  'first-step': '<path d="M6 21V4h11l-2 4 2 4H6"/>',
  explorer: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  builder: '<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14"/>',
  player: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6"/><circle cx="17.5" cy="13.5" r=".6"/>',
  sharpshooter: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  streak3: '<path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.6 1.4-3.9 2.2-5.6.9 1 1.5 2 1.6 3.3C12.5 9 12.6 6 12 3z"/>',
  lucky: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="8.5" cy="8.5" r=".9"/><circle cx="15.5" cy="8.5" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="8.5" cy="15.5" r=".9"/><circle cx="15.5" cy="15.5" r=".9"/>',
  connector: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 10.5v6M8 7.5v.01M11.5 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5M11.5 10.5v6"/>',
  ambassador: '<path d="M4 12v7h16v-7"/><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/>',
  deal: '<path d="M3.5 8.5V6h17v2.5a2.5 2.5 0 0 0 0 5V18h-17v-4.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  level: '<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 15.5V8.5h3a2.2 2.2 0 0 1 0 4.4h-3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 10.5v6M8 7.5v.01M11.5 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5M11.5 10.5v6"/>',
  share: '<path d="M4 12v7h16v-7"/><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/>',
};
