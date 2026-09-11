import { getCollection, getEntries, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type Categoria = CollectionEntry<"categorie">;
export type Progetto = CollectionEntry<"progetti">;

export async function categorieOccupate() {
  const [categorie, progetti] = await Promise.all([
    getCollection("categorie"),
    getCollection("progetti"),
  ]);
  const used = new Set<string>();
  for (const progetto of progetti) {
    for (const ref of progetto.data.categorie) used.add(ref.id);
  }
  return categorie
    .filter((c) => used.has(c.id))
    .sort((a, b) => a.data.ordine - b.data.ordine);
}

export async function tuttiIProgetti() {
  const progetti = await getCollection("progetti");
  return [...progetti].sort((a, b) => b.data.anno - a.data.anno);
}

export function idsCategorie(progetto: Progetto) {
  return progetto.data.categorie.map((c) => c.id);
}

export async function categoriaPrincipale(progetto: Progetto) {
  const principaleRef = progetto.data.principale ?? progetto.data.categorie[0];
  const entry = await getEntry(principaleRef);
  if (!entry) {
    const [first] = await getEntries(progetto.data.categorie);
    return first;
  }
  return entry;
}

export function contaPerCategoria(progetti: Progetto[], categoriaId: string) {
  return progetti.filter((p) => idsCategorie(p).includes(categoriaId)).length;
}

export function withBase(path = "") {
  const base = import.meta.env.BASE_URL ?? "/";
  const prefix = base.endsWith("/") ? base : `${base}/`;
  const cleaned = String(path).replace(/^\//, "");
  return cleaned ? `${prefix}${cleaned}` : prefix;
}

export function projectHref(id: string) {
  return withBase(`progetto/${id}`);
}

export function projectPic(foto: string, n: "01" | "02" | "03") {
  return withBase(foto.replace("01.jpg", `${n}.jpg`));
}

export function fallbackIntro(titolo: string, categoria: string) {
  return `${titolo} è un progetto di 22DESIGN (${categoria}): un lavoro in cui forma, materia e luce lavorano insieme per rendere lo spazio semplice e riconoscibile.`;
}

export function fallbackIdea() {
  return "Il progetto nasce da una lettura attenta del luogo: un unico gesto, essenziale e coerente, in cui lo spazio si organizza in modo chiaro e la luce diventa materiale del progetto.";
}

export function fallbackTecnica() {
  return "Materiali durevoli e impianti efficienti lavorano insieme per garantire continuità nel tempo: la costruzione è pensata per invecchiare bene, mantenendo la propria immagine.";
}

export function titleHtml(title: string) {
  const words = title.split(" ");
  const last = words.pop() ?? title;
  const rest = words.join(" ");
  return rest ? `${rest} <em>${last}</em>` : `<em>${last}</em>`;
}

export async function cubiHome() {
  const progetti = await tuttiIProgetti();
  return Promise.all(
    progetti.map(async (p) => {
      const principale = await categoriaPrincipale(p);
      return {
        slug: p.id,
        title: p.data.titolo,
        year: p.data.anno,
        img: p.data.img,
        photo: withBase(p.data.foto),
        categorie: idsCategorie(p),
        principaleLabel: principale?.data.label ?? "",
      };
    }),
  );
}
