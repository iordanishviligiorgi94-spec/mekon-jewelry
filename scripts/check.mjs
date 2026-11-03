import {readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const root = resolve('dist');
execFileSync(process.execPath, ['--check', 'dist/app.js'], {stdio:'inherit'});
execFileSync(process.execPath, ['--check', 'dist/pendant-hero.js'], {stdio:'inherit'});
const html = await readFile(resolve(root,'index.html'),'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const path = match[1];
  if (path.startsWith('#')) { if (!ids.includes(path.slice(1))) throw new Error(`Missing anchor ${path}`); }
  else if (!path.startsWith('https:')) await access(resolve(root,path));
}
const products = JSON.parse(await readFile(resolve(root,'assets/products.json'),'utf8'));
for (const product of products) await access(resolve(root,product.photo));
for (const match of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) await access(resolve(root,candidate.trim().split(/\s+/)[0]));
}
console.log(`Verified JavaScript, ${ids.length} unique IDs, internal links, responsive hero images and ${products.length} product photos.`);
