# Publishing tryino.com (Cloudflare Pages)

Publish only with Serdar's OK.

## Cloudflare Pages project
- Connect the GitHub repo `srdrtrkgltryino/website`, production branch `main` (merge `redesign` first).
- Build command: `npm run build` · Output directory: `dist` · Node version: from `.node-version` (24).
- Custom domains: `tryino.com` and `www.tryino.com` (one redirects to the other).
- `public/_headers` sets the security headers (CSP, HSTS, frame and referrer rules); `public/_redirects` maps the old URLs.
  Test the CSP locally after changing scripts: `npm run build`, then `python3 scripts/serve_dist.py` and open http://127.0.0.1:4400.

## After the switch
- Turn off GitHub Pages for the repo (Settings → Pages) so there is only one copy of the site.
- Google Analytics → Admin → Data collection and modification → Data retention → 14 months (the privacy policy says 14 months).
- The old site's chat widget is not on the new site; the chat backend on the Mac mini (`chat.tryino.com`) can be stopped later.
