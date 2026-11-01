"""Serve dist/ locally with the headers from public/_headers (first block), to test the Content-Security-Policy
before publishing to Cloudflare Pages. Usage: python3 scripts/serve_dist.py [port]"""
import http.server, os, sys, functools

root = os.path.join(os.path.dirname(__file__), '..')
headers = []
with open(os.path.join(root, 'public', '_headers')) as f:
    block = False
    for line in f:
        if line.startswith('/*'):
            block = True
        elif block and line.startswith('  ') and ':' in line:
            k, v = line.strip().split(':', 1)
            if k != 'Strict-Transport-Security':
                headers.append((k, v.strip().replace('; upgrade-insecure-requests', '')))
        elif block and not line.strip():
            break

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        for k, v in headers:
            self.send_header(k, v)
        super().end_headers()

    def send_head(self):
        # Clean URLs like Cloudflare Pages: /about -> /about.html
        path = self.translate_path(self.path)
        if not os.path.exists(path) and os.path.exists(path + '.html'):
            self.path = self.path.split('?')[0] + '.html'
        return super().send_head()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 4400
http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=os.path.join(root, 'dist'))).serve_forever()
