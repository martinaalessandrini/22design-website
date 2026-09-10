# STUDIO MONO® — Brief per il sito

Documento di consegna per **Astro**.  
Serve a rifare / mettere in produzione il sito partendo dal prototipo già funzionante.

**Prototipo live:** https://martinaalessandrini.github.io/Test-01/  
**Codice:** https://github.com/martinaalessandrini/Test-01  
**Contatto progetto visivo:** Martina Alessandrini (designer). Le decisioni visive e di struttura pagine sono già prese: non reinventarle.

Questo file descrive **cosa deve fare il sito**, non come deve essere scritto il codice. Puoi usare lo stack che preferisci (anche Astro, Next, HTML statico, ecc.), purché il risultato visivo e i comportamenti coincidano.

---

## 1. Cos’è

Portfolio di **STUDIO MONO®**, studio di architettura contemporanea (Milano).  
Poche pagine, molto spazio, tono essenziale. Il pezzo centrale è la **home 3D**: i progetti sono cubi che orbitano.

Lingua dell’interfaccia: **italiano**.  
Alcune voci di menu restano in inglese perché è una scelta di identità: **Works**, **Studio**, **Contatti**. Il filtro “All” resta in inglese.

---

## 2. Identità visiva (da rispettare)

| Elemento | Valore |
|---|---|
| Sfondo | beige / carta `#f2f0ea` |
| Sfondo secondario | `#e8e5dc` |
| Testo | nero `#111110` |
| Accento | terracotta `#d9552a` |
| Linee | nero al 16% di opacità |
| Font principale | **Poppins** (già in `assets/fonts/poppins/`) |
| Font secondario | **Playfair Display** (titoli di sezione, già in `assets/fonts/playfairdisplay/`) |
| Logo | `STUDIO MONO` + ® in accento, tutto maiuscolo |
| Titoli pagina | enormi, uppercase, peso 800; una parola in *italic* + colore accento |

Niente emoji. Niente ombre pesanti. Niente stock UI.  
I font sono **locali**: non caricarli da Google Fonts.

---

## 3. Mappa pagine

| Pagina | File attuale | Contenuto |
|---|---|---|
| Home | `index.html` | Modello 3D orbitale + filtri |
| Works | `works.html` | Archivio a griglia, stesse categorie |
| Scheda progetto | `about.html?progetto=<slug>` | Testo + 3 foto (01 hero, 02 idea, 03 tecnica) |
| Studio | `studio.html` | Manifesto, ambiti, metodo, persone |
| Contatti | `contact.html` | Form + recapiti |
| Cookie policy | `cookies.html` | Informativa cookie tecnici |

Menu interno (pagine interne): **Progetti** (home) · **Works** · **Studio** · **Contatti**  
Menu home: **Works** · **Studio** · **Contatti** (il logo riporta alla home).

Footer su tutte le pagine interne: copyright, email, social, link Cookie policy + riga legale cookie.  
Sulla home la riga cookie sta in piccolo sotto i filtri, per non coprire il 3D.

---

## 4. Categorie (uguali ovunque)

Ordine fisso, nomi identici su home, Works, Studio, form Contatti:

1. **Residenze**
2. **Interior & allestimenti**
3. **Spazi pubblici**
4. **Concorsi**

Più il filtro **All**.

Non usare più: Residential, Interiors, Public, Competitions, Cultura e mostre.

Nel codice interno puoi tenere id tipo `RESIDENTIAL` / `INTERIORS` / `PUBLIC` / `COMPETITIONS`, ma **in interfaccia solo i quattro nomi italiani**.

---

## 5. Progetti (6)

Fonte unica dei dati: oggi è `projects.js`.

| Slug | Titolo | Categoria | Tipo in card | Anno |
|---|---|---|---|---|
| `villa-nebbia` | Villa Nebbia | Residenze | Residenza | 2025 |
| `torre-bassa` | Torre Bassa | Residenze | Edificio misto | 2024 |
| `casa-corte` | Casa Corte | Residenze | Residenza | 2023 |
| `museo-sottosuolo` | Museo del Sottosuolo | Interior & allestimenti | Interior | 2024 |
| `hub-piazza` | Hub Piazza | Spazi pubblici | Spazio pubblico | 2022 |
| `padiglione-rosa` | Padiglione Rosa | Concorsi | Installazione | 2025 |

URL scheda: `/progetto/villa-nebbia` oppure `about.html?progetto=villa-nebbia` (va bene una route pulita in produzione).

Foto in `assets/works/<cartella>/` con tre scatti per progetto: `01` hero, `02` idea, `03` tecnica.  
Nomi cartelle attuali (con spazi): `villa nebbia`, `torre bassa`, `casa corte`, `museo del sottosuolo`, `hub piazza`, `padiglione rosa`.

Testi lunghi (intro, idea, tecnica, committente, luogo, superficie) oggi sono compilati per **Villa Nebbia**; gli altri progetti usano testi di fallback. In produzione si possono completare, ma la **struttura della scheda resta quella**.

---

## 6. Home 3D — comportamento obbligatorio

Un cubo per progetto, disposti in orbita.

- Cubi **monomateriali**, colori da rampa terracotta → tortora:  
  `#bd5836` `#c16a44` `#c77e58` `#cf9470` `#d6b18f` `#c1ab93`
- Trascina per ruotare, rotella per zoom, click sul cubo → scheda progetto.
- **Hover:** cubo sotto il mouse **1.5×**, gli altri **0.5×**. Sfondo a tutta pagina = foto del progetto in **cover** (riempie, non si deforma, niente bande).
- **Leave:** tutti tornano a scala 1 e colore pieno; lo sfondo foto sparisce.
- **Filtri:** i cubi fuori categoria si nascondono (`visible = false`) e si resettono. Ricompaiono solo con **All**. Durante il filtro: pausa di drift/deformazione, niente cubi “fantasma”.
- Hover, drag e filtri mettono in pausa orbita e deformazione.
- Rispettare `prefers-reduced-motion`.

Librerie usate nel prototipo: Three.js `0.147.0` + OrbitControls + GSAP `3.12.5`. Puoi aggiornare le versioni se il comportamento resta identico.

Testo home: kicker “Archivio orbitale — N progetti”, titolo **Il *modello* dello studio.**, hint “Trascina per esplorare · rotella per avvicinare · clicca un progetto”.

---

## 7. Works

Griglia di card. Ogni card: **foto a riempimento cover** (stesso riquadro per tutti, niente adattamento / bande vuote) + titolo + `tipo · anno`.

Filtri identici alla home. Al click si va alla scheda progetto.

---

## 8. Studio

- Kicker: “Dal 2015 a Milano”
- Titolo: **Uno studio *piccolo*, un'idea *grande*.**
- Testo breve + elenco ambiti 01–04 (stesse categorie).
- Metodo: Essenziale / Radicato / Costruito.
- Persone (placeholder visivi a gradienti oggi):  
  Martina Alessandrini — Fondatrice · Architetto  
  Davide Fontana — Fondatore · Architetto  
  Giulia Costa — Collaboratrice · Design & Materiali
- CTA verso Works: “I progetti.”

Nota: nel testo c’è “nasce nel 2017” e nel kicker “Dal 2015”. Lascia così finché Martina non decide quale data è quella giusta.

---

## 9. Contatti

Form: Nome, Email, Tipo di progetto (le 4 categorie), Messaggio.  
Invio attuale: **Web3Forms** (`https://api.web3forms.com/submit`), JSON, honeypot `botcheck` (non va nel payload).  
Access key oggi in `contact.html` — in produzione meglio non lasciarla in chiaro se cambi sistema.

Recapiti mostrati (alcuni sono di prova, da confermare prima del go-live):

- Via Canova 14, 20145 Milano, IT
- Ven. 9:00 — 18:00 o su appuntamento
- `studio@mono.example`
- +39 02 5512 3456
- Instagram, LinkedIn, Are.na (link ancora `#`)

---

## 10. Cookie / legge

Niente banner di consenso.

Il sito **non traccia**. Solo cookie tecnici (se ce ne sono), nessun analytics, nessun pixel.

- Riga in footer + link **Cookie policy**
- Pagina `cookies.html` aggiornata a **settembre 2026** (GDPR, art. 122 Codice Privacy, linee guida Garante 10 giugno 2021)

Se introduci Google Analytics, cookie di terze parti o ads, la policy va riscritta e serve il banner. **Non farlo** se non è richiesto.

---

## 11. Cosa è prototipo / da sostituire

Da trattare come contenuto finto o da validare:

- Email `studio@mono.example`
- Telefono e orari
- Indirizzo Via Canova
- Foto team (oggi sono gradienti, non ritratti)
- Testi completi solo su Villa Nebbia
- Social senza URL veri
- Favicon da Icons8

Da **non** cambiare senza Martina:

- Palette, tipografia, gerarchia dei titoli
- Cubi orbitanti e regole hover/filtri
- Nomi e ordine delle categorie
- Foto progetti in cover (Works e hover home)
- Tono dei testi (essenziale, niente marketing rumoroso)

---

## 12. Accesso al prototipo

Cartella locale del prototipo: repo `Test-01`.  
Sviluppo attuale: sito statico, `node server.js` → `http://localhost:8000`.

File utili da copiare come riferimento:

- `style.css` / `home.css` — sistema visivo
- `home3d.js` — logica cubi
- `projects.js` — dati
- `assets/fonts/` e `assets/works/` — font e foto

---

## 13. Definition of done

Il sito è pronto quando:

1. Si naviga home → Works → scheda → Studio → Contatti senza perdere identità visiva.
2. Le 4 categorie coincidono in ogni pagina, nello stesso ordine.
3. Hover e filtri 3D si comportano come nel prototipo live.
4. Le foto in Works riempiono il riquadro (cover).
5. Il form arriva (o è chiaramente collegato a un servizio reale).
6. Cookie policy presente, nessun banner, nessun tracker.
7. Mobile: menu hamburger sulle pagine interne; home usabile anche su schermo stretto.

---

*Brief redatto il 10 settembre 2026 sul prototipo Test-01.*
