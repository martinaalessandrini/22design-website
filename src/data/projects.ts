export type CategoryId = "ALL" | "RESIDENTIAL" | "INTERIORS" | "PUBLIC" | "COMPETITIONS";

export type Project = {
  slug: string;
  title: string;
  category: Exclude<CategoryId, "ALL">;
  type: string;
  year: number;
  img: string;
  photo: string;
  committente?: string;
  luogo?: string;
  superficie?: string;
  intro?: string;
  idea?: string;
  tecnica?: string;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "RESIDENTIAL", label: "Residenze" },
  { id: "INTERIORS", label: "Interior & allestimenti" },
  { id: "PUBLIC", label: "Spazi pubblici" },
  { id: "COMPETITIONS", label: "Concorsi" },
];

export const PROJECTS: Project[] = [
  {
    slug: "villa-nebbia",
    title: "Villa Nebbia",
    category: "RESIDENTIAL",
    type: "Residenza",
    year: 2025,
    img: "villa",
    photo: "/works/villa nebbia/nebbia 01.jpg",
    committente: "Privato",
    luogo: "Lombardia, IT",
    superficie: "380 m²",
    intro:
      "Una residenza avvolta nella nebbia padana: un volume lungo, basso e opaco a sud, interamente vetrato a nord. Il paesaggio entra in casa, la casa resta discreta.",
    idea: "La casa si sviluppa su una sola quota, organizzata attorno a due corti: una asciutta e pavimentata, l'altra verde e scavata. Gli spazi giorno si affacciano sulla prima, le camere sulla seconda. Il materiale è unico — calcestruzzo pigmentato — per rendere il volume compatto e monocromo. La luce entra da nord in maniera costante e diffusa; a sud, grandi portali scorrevoli si chiudono quando il sole è troppo forte. D'estate la casa si apre, d'inverno si raccoglie.",
    tecnica:
      "Struttura in cemento armato a vista, solai in laterocemento a vista, serramenti in alluminio a taglio termico. Impianto a pavimento radiante alimentato da pompe di calore geotermiche. Un'unica penna architettonica, dal fondo scala al colore del portoncino.",
  },
  {
    slug: "torre-bassa",
    title: "Torre Bassa",
    category: "RESIDENTIAL",
    type: "Edificio misto",
    year: 2024,
    img: "torre",
    photo: "/works/torre bassa/torre bassa 01.jpg",
  },
  {
    slug: "casa-corte",
    title: "Casa Corte",
    category: "RESIDENTIAL",
    type: "Residenza",
    year: 2023,
    img: "corte",
    photo: "/works/casa corte/casa corte 01.jpg",
  },
  {
    slug: "museo-sottosuolo",
    title: "Museo del Sottosuolo",
    category: "INTERIORS",
    type: "Interior",
    year: 2024,
    img: "museo",
    photo: "/works/museo del sottosuolo/museo sottosuolo 01.jpg",
  },
  {
    slug: "hub-piazza",
    title: "Hub Piazza",
    category: "PUBLIC",
    type: "Spazio pubblico",
    year: 2022,
    img: "hub",
    photo: "/works/hub piazza/hub piazza 01.jpg",
  },
  {
    slug: "padiglione-rosa",
    title: "Padiglione Rosa",
    category: "COMPETITIONS",
    type: "Installazione",
    year: 2025,
    img: "padiglione",
    photo: "/works/padiglione rosa/padiglione rosa 01.jpg",
  },
];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function categoryCount(id: CategoryId) {
  if (id === "ALL") return PROJECTS.length;
  return PROJECTS.filter((p) => p.category === id).length;
}

export function projectsByCategory(id: CategoryId) {
  if (id === "ALL") return PROJECTS;
  return PROJECTS.filter((p) => p.category === id);
}

export function projectHref(slug: string) {
  return `/progetto/${slug}`;
}

export function projectPic(project: Project, n: "01" | "02" | "03") {
  return project.photo.replace("01.jpg", `${n}.jpg`);
}

export function fallbackIntro(project: Project) {
  return `${project.title} è ${project.type.toLowerCase()} firmato da STUDIO MONO (${categoryLabel(project.category)}): un lavoro in cui forma, materia e luce lavorano insieme per rendere lo spazio semplice e riconoscibile.`;
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
