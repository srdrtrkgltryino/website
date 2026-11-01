// Languages, routes and the strings shared by every page (navigation, footer, cookie consent).
// Page-specific text lives next to its markup in src/views/*.

export type Lang = 'en' | 'tr';
export const LANGS: Lang[] = ['en', 'tr'];

export const routes = {
  home: '/',
  ino: '/ino-loyalty',
  features: '/ino-loyalty/features',
  integrations: '/ino-loyalty/integrations',
  developers: '/ino-loyalty/developers',
  apiReference: '/ino-loyalty/developers/api',
  crm: '/services/crm-implementation',
  browserping: '/products/browserping',
  about: '/about',
  contact: '/contact',
  demo: '/contact#demo',
  support: '/support',
  privacy: '/privacy',
  privacyShopify: '/privacy/ino-loyalty-shopify',
  privacyIkas: '/privacy/ino-loyalty-ikas',
  cookies: '/cookies',
  terms: '/terms',
  pricing: '/pricing', // hidden: not linked, noindex
  play: '/play',
} as const;
export type RouteKey = keyof typeof routes;

/** Localised URL for a route ('/tr' prefix for Turkish). */
export const href = (lang: Lang, key: RouteKey) => {
  const p = routes[key];
  if (lang === 'en') return p;
  const [path, hash] = p.split('#');
  return (path === '/' ? '/tr' : `/tr${path}`) + (hash ? `#${hash}` : '');
};

/** Page path without `.html`, `/index` or a trailing slash (build output uses `/index.html` and `/tr.html`). */
export const cleanPath = (pathname: string) => pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';

/** The same page in the other language. */
export const switchPath = (lang: Lang, pathname: string) => {
  const clean = cleanPath(pathname);
  if (lang === 'tr') return clean.replace(/^\/tr(?=\/|$)/, '') || '/';
  return clean === '/' ? '/tr' : `/tr${clean}`;
};

export const ui = {
  en: {
    skip: 'Skip to content',
    nav: {
      ino: 'Ino Loyalty',
      inoOverview: 'Overview',
      inoOverviewDesc: 'The loyalty platform for retail and e-commerce',
      features: 'Features',
      featuresDesc: 'Programs, tiers, campaigns, wallet, privacy',
      integrations: 'Integrations',
      integrationsDesc: 'Shopify, ikas, SAP Commerce Cloud, Akinon',
      developers: 'For developers',
      developersDesc: 'Real-time API, webhooks, event catalog',
      services: 'Services',
      crm: 'CRM implementation',
      crmDesc: 'Microsoft Dynamics 365 Sales, Customer Insights, Customer Service',
      browserping: 'BrowserPing',
      browserpingDesc: 'Dynamics 365 add-on: web push and in-page banners',
      company: 'Company',
      profile: 'Open my visitor profile',
      pts: 'pts',
      about: 'About Tryino',
      contact: 'Contact',
      support: 'Support',
      demo: 'Book a demo',
      menu: 'Menu',
      close: 'Close',
      language: 'Language',
    },
    footer: {
      tagline: 'Loyalty and customer engagement software, and the CRM work around it.',
      product: 'Ino Loyalty',
      services: 'Services',
      company: 'Company',
      legal: 'Legal',
      privacy: 'Privacy policy',
      cookies: 'Cookie policy',
      terms: 'Terms of use',
      cookieSettings: 'Cookie settings',
      rights: 'All rights reserved.',
    },
    consent: {
      title: 'Cookies on tryino.com',
      body: 'We use necessary cookies to run the site. With your permission we also use analytics cookies to understand how the site is used. You can change your choice any time.',
      accept: 'Accept all',
      reject: 'Necessary only',
      settings: 'Choose',
      save: 'Save choices',
      necessary: 'Necessary',
      necessaryDesc: 'Language, your cookie choice and the visitor profile you start. Always on.',
      analytics: 'Analytics',
      analyticsDesc: 'Google Analytics, to count visits and see which pages help. Off until you allow it.',
      policy: 'Cookie policy',
    },
  },
  tr: {
    skip: 'İçeriğe geç',
    nav: {
      ino: 'Ino Loyalty',
      inoOverview: 'Genel bakış',
      inoOverviewDesc: 'Perakende ve e-ticaret için sadakat platformu',
      features: 'Özellikler',
      featuresDesc: 'Program, kademe, kampanya, cüzdan, gizlilik',
      integrations: 'Entegrasyonlar',
      integrationsDesc: 'Shopify, ikas, SAP Commerce Cloud, Akinon',
      developers: 'Geliştiriciler için',
      developersDesc: 'Gerçek zamanlı API, webhook\'lar, olay kataloğu',
      services: 'Hizmetler',
      crm: 'CRM implementasyonu',
      crmDesc: 'Microsoft Dynamics 365 Sales, Customer Insights, Customer Service',
      browserping: 'BrowserPing',
      browserpingDesc: 'Dynamics 365 eklentisi: web push ve sayfa içi banner',
      company: 'Şirket',
      profile: 'Ziyaretçi profilimi aç',
      pts: 'puan',
      about: 'Tryino hakkında',
      contact: 'İletişim',
      support: 'Destek',
      demo: 'Demo planlayın',
      menu: 'Menü',
      close: 'Kapat',
      language: 'Dil',
    },
    footer: {
      tagline: 'Sadakat ve müşteri etkileşimi yazılımı, ve çevresindeki CRM işleri.',
      product: 'Ino Loyalty',
      services: 'Hizmetler',
      company: 'Şirket',
      legal: 'Yasal',
      privacy: 'Gizlilik politikası',
      cookies: 'Çerez politikası',
      terms: 'Kullanım koşulları',
      cookieSettings: 'Çerez ayarları',
      rights: 'Tüm hakları saklıdır.',
    },
    consent: {
      title: 'tryino.com\'da çerezler',
      body: 'Sitenin çalışması için zorunlu çerezler kullanıyoruz. İzin verirseniz, sitenin nasıl kullanıldığını anlamak için analiz çerezleri de kullanırız. Tercihinizi istediğiniz zaman değiştirebilirsiniz.',
      accept: 'Tümünü kabul et',
      reject: 'Yalnız zorunlu',
      settings: 'Seç',
      save: 'Seçimi kaydet',
      necessary: 'Zorunlu',
      necessaryDesc: 'Dil, çerez tercihiniz ve başlattığınız ziyaretçi profili. Her zaman açık.',
      analytics: 'Analiz',
      analyticsDesc: 'Google Analytics; ziyaretleri saymak ve hangi sayfaların işe yaradığını görmek için. Siz izin verene kadar kapalı.',
      policy: 'Çerez politikası',
    },
  },
} as const;

export const t = (lang: Lang) => ui[lang];
