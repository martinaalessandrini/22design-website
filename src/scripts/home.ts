import { createHome3D } from "./home3d";

type CubeProject = {
  slug: string;
  title: string;
  year: number;
  img: string;
  photo: string;
  categorie: string[];
  principaleLabel: string;
};

const scene = document.getElementById("scene");
const tip = document.getElementById("cubeTip");
const tipText = tip?.querySelector(".cube-tip-inner");
const filtersEl = document.getElementById("homeFilters");
const hintEl = document.getElementById("homeHint");
const loadingEl = document.getElementById("homeLoading");
const dataEl = document.getElementById("archivio-json");
const projects: CubeProject[] = dataEl ? JSON.parse(dataEl.textContent || "[]") : [];

function hideLoading() {
  loadingEl?.classList.add("is-done");
}

function setActiveFilter(id: string) {
  filtersEl?.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", (b as HTMLButtonElement).dataset.filter === id);
  });
}

function enableFilters() {
  filtersEl?.querySelectorAll("button").forEach((b) => {
    (b as HTMLButtonElement).disabled = false;
  });
}

if (!scene) {
  hideLoading();
} else {
  try {
    const app = createHome3D(scene, projects);

    filtersEl?.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLButtonElement).dataset.filter;
        if (!id) return;
        setActiveFilter(id);
        app.setFilter(id);
      });
    });

    app.onHover((info: { title: string; category: string; year: number; x: number; y: number } | null) => {
      if (!info) {
        tip?.classList.add("is-hidden");
        return;
      }
      tip?.classList.remove("is-hidden");
      if (tipText) {
        tipText.innerHTML =
          `<span class="tip-title">${info.title}</span>` +
          `<span class="tip-meta mono">${info.category} · ${info.year}</span>`;
      }
      if (tip) {
        tip.style.transform = `translate(${info.x}px, ${info.y}px) translate(-50%, -150%)`;
      }
    });

    app.onSelect((project: CubeProject) => {
      window.location.assign(`${import.meta.env.BASE_URL}progetto/${project.slug}`);
    });

    app.ready.then(() => {
      hideLoading();
      enableFilters();
    });
  } catch (err) {
    console.error("Impossibile inizializzare la scena 3D:", err);
    hideLoading();
    if (hintEl) hintEl.textContent = "Modello 3D non disponibile — usa il menu per continuare.";
  }
}

setTimeout(() => {
  hideLoading();
  enableFilters();
}, 9000);
