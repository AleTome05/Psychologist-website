// Generatore statico, zero dipendenze. Uso: `node build.mjs`
// Assembla src/pages/** con layout e partials e scrive l'HTML finale nella root del progetto,
// così il sito resta pubblicabile così com'è (GitHub Pages, Netlify, qualsiasi hosting statico).
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');

// ---------------------------------------------------------------------------
// Dati del sito: modificare qui recapiti e servizi, si aggiornano ovunque.
// ---------------------------------------------------------------------------
const SITE = {
  url: '', // es. 'https://www.chiarasergenti.it' — se valorizzato genera canonical e sitemap.xml
  name: 'Dott.ssa Chiara Sergenti',
  phone: '+39 347 3583953',
  phoneHref: '+393473583953',
  whatsapp: '393473583953',
  email: 'chiarasegenti@hotmail.it',
  albo: 'Ordine degli Psicologi dell’Emilia-Romagna, sez. A n. [numero iscrizione]',
  piva: '[P.IVA]',
};

const SERVICES = [
  { slug: 'psicoterapia-cbt', icon: 'mind', title: 'Psicoterapia cognitivo-comportamentale',
    short: 'Ansia, attacchi di panico, umore, sonno, stress e adattamento.', nav: 'Ansia, panico, umore, sonno' },
  { slug: 'coppia-e-genitorialita', icon: 'heart', title: 'Coppia e parent training',
    short: 'Comunicazione, conflitti e strumenti concreti per essere genitori.', nav: 'Relazioni e famiglia' },
  { slug: 'mindfulness', icon: 'leaf', title: 'Mindfulness e rilassamento',
    short: 'Respirazione, rilassamento e consapevolezza con tecniche validate.', nav: 'Gestione dello stress' },
  { slug: 'psicologia-dello-sport', icon: 'target', title: 'Psicologia dello sport',
    short: 'Mental training, gestione della gara e supporto all’atleta infortunato.', nav: 'Atleti, squadre e staff' },
  { slug: 'team-building', icon: 'compass', title: 'Team building outdoor',
    short: 'Percorsi esperienziali basati sull’orienteering, a impatto zero.', nav: 'Aziende, enti e scuole' },
  { slug: 'formazione', icon: 'graduation', title: 'Formazione e consulenza',
    short: 'Docenze per tecnici, dirigenti, insegnanti e professionisti.', nav: 'CONI, federazioni, master' },
];

// Icone lineari 24×24 (stroke = currentColor)
const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  mind: '<path d="M12 3a7 7 0 0 0-4 12.7V21h7v-3h2a2 2 0 0 0 2-2v-3l1.6-.6c.5-.2.6-.8.3-1.2L19 9.5A7 7 0 0 0 12 3Z"/><path d="M10 9.2a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.3 1-1.3 1.9"/>',
  heart: '<path d="M19.5 12.6 12 20l-7.5-7.4A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 7.5 6.3Z"/>',
  leaf: '<path d="M11 20a7 7 0 0 1-7-7c0-5 4-9 16-9 0 12-4 16-9 16Z"/><path d="M4 20c3-5 6-8 11-11"/>',
  breath: '<path d="M3 8h11a3 3 0 1 0-3-3M3 16h14a3 3 0 1 1-3 3M3 12h17"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  graduation: '<path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
  medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.6 10.7 6 3h4l2 5 2-5h4l-2.6 7.7"/><path d="m12 12.6.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2Z"/>',
  team: '<circle cx="12" cy="7" r="3"/><circle cx="5" cy="9.5" r="2"/><circle cx="19" cy="9.5" r="2"/><path d="M7 20v-1a5 5 0 0 1 10 0v1M2 19v-.5a3 3 0 0 1 3-3M22 19v-.5a3 3 0 0 0-3-3"/>',
  family: '<circle cx="9" cy="7.5" r="3.5"/><path d="M2.5 20v-1A4.5 4.5 0 0 1 7 14.5h4a4.5 4.5 0 0 1 4.5 4.5v1"/><circle cx="17.5" cy="10.5" r="2.5"/><path d="M18 15.5a3.5 3.5 0 0 1 3.5 3.5v1"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  flag: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
  inclusion: '<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5h14M12 8.5v5l-3.5 7M12 13.5l3.5 7"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  whatsapp: '<path d="M3.5 20.5 4.8 16.3A8.5 8.5 0 1 1 8 19.4Z"/><path d="M9 8.6c0 3.3 3 6.4 6.4 6.4l1-1.6-2-1-1 1a5.8 5.8 0 0 1-2.8-2.8l1-1-1-2Z"/>',
  article: '<path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
  tv: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 2 4 4 4-4"/>',
  pin: '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  book: '<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h14"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4M12 2v3"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
};

const icon = (name) => {
  if (!ICONS[name]) throw new Error(`Icona sconosciuta: ${name}`);
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
};
const waLink = (text) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

// Blocchi generati dai dati dei servizi
const serviceBlocks = {
  dropdown: () => SERVICES.map((s) => `<li><a href="{{root}}servizi/${s.slug}.html" data-sub="${s.slug}"><span class="card__icon">${icon(s.icon)}</span><span><strong>${s.title}</strong><small>${s.nav}</small></span></a></li>`).join('\n'),
  mobile: () => SERVICES.map((s) => `<li><a href="{{root}}servizi/${s.slug}.html" data-sub="${s.slug}">${s.title}</a></li>`).join('\n'),
  footer: () => SERVICES.map((s) => `<li><a href="{{root}}servizi/${s.slug}.html">${s.title}</a></li>`).join('\n'),
  cards: (exclude) => SERVICES.filter((s) => s.slug !== exclude).map((s, i) => `
<a class="card" href="{{root}}servizi/${s.slug}.html" data-reveal style="--delay:${(i % 3) * 0.08}s">
  <span class="card__icon">${icon(s.icon)}</span>
  <h3>${s.title}</h3>
  <p>${s.short}</p>
  <span class="link-arrow">Scopri di più ${icon('arrow')}</span>
</a>`).join('\n'),
};

// ---------------------------------------------------------------------------
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])));
  return files.flat().filter((f) => f.endsWith('.html'));
}

async function loadPartials() {
  const dir = join(SRC, 'partials');
  const partials = {};
  for (const file of await readdir(dir)) {
    partials[file.replace(/\.(html|svg)$/, '')] = (await readFile(join(dir, file), 'utf8')).trim();
  }
  return partials;
}

function render(template, ctx, partials) {
  let out = template;
  // Partials annidati (max 5 livelli)
  for (let i = 0; i < 5 && /{{>\s*[\w-]+\s*}}/.test(out); i++) {
    out = out.replace(/{{>\s*([\w-]+)\s*}}/g, (_, name) => {
      if (!(name in partials)) throw new Error(`Partial mancante: ${name}`);
      return partials[name];
    });
  }
  out = out
    .replace(/{{services:(\w+)(?::([\w-]+))?}}/g, (_, kind, arg) => serviceBlocks[kind](arg))
    .replace(/{{icon:([\w-]+)}}/g, (_, name) => icon(name))
    .replace(/{{wa:([^}]+)}}/g, (_, text) => waLink(text.trim()))
    .replace(/{{site\.(\w+)}}/g, (_, key) => SITE[key] ?? '')
    .replace(/{{(\w+)}}/g, (m, key) => (key in ctx ? ctx[key] : m));
  // Voce di menu attiva
  if (ctx.nav) out = out.replaceAll(`data-nav="${ctx.nav}"`, `data-nav="${ctx.nav}" aria-current="page"`);
  if (ctx.sub) out = out.replaceAll(`data-sub="${ctx.sub}"`, `data-sub="${ctx.sub}" aria-current="page"`);
  return out;
}

async function build() {
  const partials = await loadPartials();
  const layout = await readFile(join(SRC, 'layout.html'), 'utf8');
  const pagesDir = join(SRC, 'pages');
  const pages = await walk(pagesDir);
  const sitemap = [];

  for (const file of pages) {
    const relPath = relative(pagesDir, file);
    const raw = await readFile(file, 'utf8');
    const match = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->/);
    if (!match) throw new Error(`Front-matter JSON mancante in ${relPath}`);
    const meta = JSON.parse(match[1]);
    const depth = relPath.split('/').length - 1;
    const root = meta.root ?? (depth ? '../'.repeat(depth) : ''); // "root" nel front-matter forza percorsi assoluti (es. 404)
    const urlPath = relPath.replace(/index\.html$/, '');
    const ctx = {
      title: meta.title,
      description: meta.description,
      nav: meta.nav || '',
      sub: meta.sub || '',
      root,
      bodyClass: meta.bodyClass || '',
      footerClass: meta.footerFlush ? 'site-footer--flush' : '',
      canonical: SITE.url ? `<link rel="canonical" href="${SITE.url}/${urlPath}">` : '',
      robots: meta.noindex ? '<meta name="robots" content="noindex">' : '',
    };
    // Il contenuto entra nel layout prima del render, così può usare partials e segnaposto
    const content = raw.slice(match[0].length).trim();
    const html = render(layout.replace('{{content}}', () => content), ctx, partials);
    const leftover = html.match(/{{[^}]+}}/);
    if (leftover) throw new Error(`Segnaposto non risolto in ${relPath}: ${leftover[0]}`);
    const outFile = join(ROOT, relPath);
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, html);
    if (!meta.noindex) sitemap.push(urlPath);
    console.log(`✓ ${relPath}`);
  }

  if (SITE.url) {
    const urls = sitemap.map((p) => `  <url><loc>${SITE.url}/${p}</loc></url>`).join('\n');
    await writeFile(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    await writeFile(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
    console.log('✓ sitemap.xml, robots.txt');
  }
}

build().catch((err) => { console.error(err.message); process.exit(1); });
