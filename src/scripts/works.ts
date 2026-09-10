const filters = document.getElementById("filters");
const grid = document.getElementById("worksGrid");
if (filters && grid) {
  const cards = [...grid.querySelectorAll<HTMLElement>(".work-card")];

  filters.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLButtonElement).dataset.filter;
      filters.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cards.forEach((card) => {
        const cats = (card.dataset.cats ?? "").split(" ").filter(Boolean);
        const show = id === "ALL" || cats.includes(id ?? "");
        card.classList.toggle("hidden", !show);
      });
    });
  });
}
