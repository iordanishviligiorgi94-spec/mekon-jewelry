import {mkdir, writeFile} from 'node:fs/promises';
const base = new URL('../dist/assets/fonts/', import.meta.url);
await mkdir(base, {recursive:true});
const url = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500&family=Noto+Sans+Georgian:wght@400;500;600&family=Noto+Serif+Georgian:wght@300;400&display=swap';
const response = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'}});
if (!response.ok) throw new Error('Font CSS download failed');
let css = await response.text();
const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(match => match[1]))];
await Promise.all(urls.map(async (url, index) => {
  const result = await fetch(url); if (!result.ok) throw new Error('Font download failed');
  const name = `font-${index}.woff2`;
  await writeFile(new URL(name, base), Buffer.from(await result.arrayBuffer()));
  css = css.replaceAll(url, name);
}));
await writeFile(new URL('fonts.css', base), css);
console.log(`Saved ${urls.length} local font subsets.`);
