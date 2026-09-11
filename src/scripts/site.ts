const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
  });

  nav.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).tagName === "A") {
      nav.classList.remove("open");
      toggle.classList.remove("open");
    }
  });
}

const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("revealed"));
}

const form = document.getElementById("contactForm") as HTMLFormElement | null;
const status = document.getElementById("formStatus");

if (form && status) {
  const accessKeyInput = form.querySelector<HTMLInputElement>('input[name="access_key"]');
  const accessKey = accessKeyInput?.value ?? "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botcheck = form.querySelector<HTMLInputElement>('input[name="botcheck"]');
    if (botcheck?.checked) return;

    status.className = "form-status";
    status.textContent = "";
    let valid = true;

    form.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));

    const nome = form.elements.namedItem("name") as HTMLInputElement;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const msg = form.elements.namedItem("message") as HTMLTextAreaElement;
    const categoria = form.elements.namedItem("categoria") as HTMLSelectElement;

    if (!nome.value.trim()) {
      markInvalid(nome, "Serve il tuo nome.");
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      markInvalid(email, "Email non valida.");
      valid = false;
    }
    if (msg.value.trim().length < 10) {
      markInvalid(msg, "Scrivi almeno 10 caratteri.");
      valid = false;
    }

    if (!valid) return;

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    status.textContent = "Invio in corso…";

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: "Nuovo messaggio dal sito 22DESIGN",
          name: nome.value.trim(),
          email: email.value.trim(),
          categoria: categoria.value,
          message: msg.value.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        status.classList.add("ok");
        status.textContent = "Grazie! Messaggio inviato. Ti risponderemo entro 48 ore.";
        form.reset();
      } else {
        status.classList.add("err");
        status.textContent = "Invio non riuscito: " + (data.message || "riprova tra poco.");
      }
    } catch {
      status.classList.add("err");
      status.textContent = "Errore di rete. Controlla la connessione e riprova.";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function markInvalid(el: HTMLElement, message: string) {
    const field = el.closest(".field");
    if (!field) return;
    field.classList.add("invalid");
    const err = field.querySelector(".error");
    if (err) err.textContent = message;
    else {
      const p = document.createElement("p");
      p.className = "error";
      p.textContent = message;
      field.appendChild(p);
    }
  }
}
