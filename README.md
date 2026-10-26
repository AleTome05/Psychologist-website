# Sito Dott.ssa Chiara Sergenti

Sito statico professionale: psicoterapia cognitivo-comportamentale, psicologia dello sport, team building e formazione.

## Struttura

```
src/                     ← SORGENTI: si modificano solo qui
  layout.html            scheletro comune (head, header, footer, script)
  partials/              head, header, footer, logo-mark.svg
  pages/                 contenuto di ogni pagina (+ front-matter JSON con title/description)
    servizi/             una pagina per servizio
build.mjs                generatore (Node, zero dipendenze) + dati: recapiti e elenco servizi
assets/css/styles.css    design system (token colore, tipografia, componenti, animazioni)
assets/js/main.js        header, menu mobile, dropdown, reveal allo scroll, WhatsApp, form
assets/img/              logo.svg (logo completo), favicon.svg
*.html, servizi/*.html   ← GENERATI da `node build.mjs`: non modificarli a mano
```

## Come si lavora

```bash
node build.mjs
```

Rigenera tutte le pagine HTML nella root. Il sito è pronto per qualsiasi hosting statico (GitHub Pages, Netlify, Aruba…).

- **Recapiti, n. Albo, P.IVA**: oggetto `SITE` in `build.mjs`.
- **Servizi** (menu, footer, card): array `SERVICES` in `build.mjs`.
- **Dominio**: impostando `SITE.url` il build genera anche `canonical`, `sitemap.xml` e `robots.txt`.

- **Recensioni**: file `src/data/recensioni.json` (vedi sotto).

Segnaposto disponibili nelle pagine: `{{root}}`, `{{> partial}}`, `{{icon:nome}}`, `{{wa:testo}}` (link WhatsApp precompilato), `{{site.chiave}}`, `{{services:cards}}`, `{{reviews:all}}`, `{{reviews:home}}`.

## Aggiungere una recensione

Aprire `src/data/recensioni.json`, copiare un blocco `{ … }` esistente in fondo all’elenco (ricordando la virgola tra un blocco e l’altro), compilarlo e lanciare `node build.mjs`.

| Campo | Obbligatorio | Contenuto |
|---|---|---|
| `autore` | sì | Nome come deve comparire (es. “Gianni”, “Nicola P.”). Le iniziali dell’avatar si calcolano da qui |
| `ruolo` | no | Chi è (es. “Ultramaratoneta”) |
| `categoria` | sì | Etichetta colorata: es. “Atleti”, “Pazienti”, “Società sportive”, “Colleghi e partner” |
| `contesto` | no | Su cosa si è lavorato (es. “Preparazione mentale per la 100 km del Passatore”) |
| `estratto` | sì | Una frase del testo da mettere in evidenza |
| `testo` | sì | Elenco di paragrafi: `["primo paragrafo", "secondo paragrafo"]` |
| `home` | no | `true` per mostrarla in Home (al massimo 3, le prime dell’elenco) |

Pubblicare solo con il consenso scritto dell’autore; per i pazienti meglio usare nome di battesimo o iniziali.

## Prima della pubblicazione

- [ ] Inserire numero di iscrizione all’Albo e P.IVA (`SITE` in `build.mjs`)
- [ ] Verificare l’indirizzo email (sul biglietto risulta `chiarasegenti@hotmail.it`)
- [ ] Confermare le informazioni biografiche (anni, titoli, ruoli) e la modalità “in presenza e online”
- [ ] Far verificare `privacy.html` a un consulente
- [ ] Facoltativo: foto professionale, immagine `og:image` (1200×630 PNG), font self-hosted
