// Copies the self-hosted Scalar API reference bundle into public/ so the API reference page loads it from
// our own domain (no CDN, no third-party requests). Runs before `astro dev` and `astro build`.
import {copyFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = join(root, 'node_modules', '@scalar', 'api-reference');
const dest = join(root, 'public', 'developers', 'scalar');
mkdirSync(dest, {recursive: true});
copyFileSync(join(pkg, 'dist', 'browser', 'standalone.js'), join(dest, 'standalone.js'));
console.log('Scalar standalone bundle copied to public/developers/scalar/');
