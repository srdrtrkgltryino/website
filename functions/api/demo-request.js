// POST /api/demo-request: Cloudflare Pages Function behind the contact page's demo form. It validates the request and
// e-mails the team through Microsoft Graph (reply-to = the visitor). Nothing is stored.
//
// Environment variables (Cloudflare Pages → Settings → Variables and Secrets, Production and Preview):
//   GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET (secret): an Entra app with Mail.Send, limited to MAIL_FROM
//   MAIL_FROM: the mailbox that sends, MAIL_TO: where requests arrive

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max) : '');
const json = (status, body) => new Response(body ? JSON.stringify(body) : null, {status, headers: {'Content-Type': 'application/json'}});

async function graphToken(env) {
  const res = await fetch(`https://login.microsoftonline.com/${env.GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.GRAPH_CLIENT_ID,
      client_secret: env.GRAPH_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
    }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return (await res.json()).access_token;
}

async function sendMail(env, {subject, text, replyTo}) {
  const token = await graphToken(env);
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MAIL_FROM)}/sendMail`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      message: {
        subject,
        body: {contentType: 'Text', content: text},
        toRecipients: [{emailAddress: {address: env.MAIL_TO}}],
        replyTo: [{emailAddress: {address: replyTo}}],
      },
      saveToSentItems: true,
    }),
  });
  if (!res.ok) throw new Error(`sendMail ${res.status}`);
}

// Temporary diagnostics (GET): which settings are present and whether Microsoft accepts the credentials.
// Shows names, true/false and Microsoft error codes only, never values.
export async function onRequestGet({env}) {
  const names = ['GRAPH_TENANT_ID', 'GRAPH_CLIENT_ID', 'GRAPH_CLIENT_SECRET', 'MAIL_FROM', 'MAIL_TO'];
  const present = Object.fromEntries(names.map((n) => [n, Boolean(env[n])]));
  let token = 'not tried';
  if (present.GRAPH_TENANT_ID && present.GRAPH_CLIENT_ID && present.GRAPH_CLIENT_SECRET) {
    const res = await fetch(`https://login.microsoftonline.com/${env.GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({grant_type: 'client_credentials', client_id: env.GRAPH_CLIENT_ID, client_secret: env.GRAPH_CLIENT_SECRET, scope: 'https://graph.microsoft.com/.default'}),
    });
    const body = await res.json().catch(() => ({}));
    token = res.ok ? 'ok' : `error ${res.status} ${(body.error_codes || []).join(',')} ${body.error || ''}`.trim();
  }
  return json(200, {present, token});
}

export async function onRequestPost({request, env}) {
  // Same-site only: the form lives on tryino.com and its Cloudflare previews.
  const origin = request.headers.get('Origin') || '';
  if (origin && !/^https:\/\/((www\.)?tryino\.com|[a-z0-9-]+\.serdartryino\.pages\.dev)$/.test(origin)) return json(403, {error: 'origin'});

  let b;
  try {
    b = await request.json();
  } catch {
    return json(400, {error: 'invalid json'});
  }
  if (clean(b.website, 200)) return json(204); // honeypot: bots fill it, people don't
  const d = {
    lang: b.lang === 'tr' ? 'tr' : 'en',
    name: clean(b.name, 120),
    email: clean(b.email, 200),
    company: clean(b.company, 160),
    phone: clean(b.phone, 40),
    topic: clean(b.topic, 120),
    message: clean(b.message, 3000),
    coupon: /^INO(POC|3M)-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(clean(b.coupon, 24).toUpperCase()) ? clean(b.coupon, 24).toUpperCase() : '',
    linkedin: clean(b.linkedin, 200),
    slotLabel: clean(b.slotLabel, 120),
  };
  if (!d.name || !d.company || !EMAIL_RE.test(d.email)) return json(400, {error: 'name, company and a valid email are required'});

  const text = [
    'tryino.com üzerinden demo talebi',
    '',
    `Ad Soyad: ${d.name}`,
    `Firma: ${d.company}`,
    `E-posta: ${d.email}`,
    `Telefon: ${d.phone || '-'}`,
    `Konu: ${d.topic || '-'}`,
    `Tercih edilen zaman: ${d.slotLabel ? `${d.slotLabel} (Türkiye saati)` : 'belirtilmedi'}`,
    `Ücretsiz POC kodu: ${d.coupon || '-'}`,
    `LinkedIn: ${d.linkedin || '-'}`,
    `Site dili: ${d.lang.toUpperCase()}`,
    '',
    d.message ? `Mesaj:\n${d.message}` : 'Mesaj: -',
    '',
    'Bu e-postayı yanıtlarsanız yanıt doğrudan ziyaretçiye gider. Saat yalnızca tercihtir; onayı e-postayla verin.',
  ].join('\n');

  try {
    await sendMail(env, {subject: `Demo talebi: ${d.company} (${d.name})`, text, replyTo: d.email});
    return json(204);
  } catch (err) {
    console.error('demo-request failed:', err.message);
    return json(502, {error: 'mail failed'});
  }
}
