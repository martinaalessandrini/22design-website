import { withBase } from "./archivio";

/** In produzione (e in preview) le pagine interne non sono pubbliche. */
export function paginaInterna(Astro: {
  redirect: (path: string) => Response;
}) {
  if (import.meta.env.DEV) return;
  return Astro.redirect(withBase());
}
