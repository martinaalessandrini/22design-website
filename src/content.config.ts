import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const categorie = defineCollection({
  loader: file("src/content/categorie.json"),
  schema: z.object({
    label: z.string(),
    ordine: z.number(),
  }),
});

const progetti = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/progetti" }),
  schema: z
    .object({
      titolo: z.string(),
      anno: z.number(),
      categorie: z.array(reference("categorie")).min(1),
      principale: reference("categorie").optional(),
      img: z.string(),
      foto: z.string(),
      committente: z.string().optional(),
      luogo: z.string().optional(),
      superficie: z.string().optional(),
      intro: z.string().optional(),
      idea: z.string().optional(),
      tecnica: z.string().optional(),
    })
    .refine(
      (data) => {
        if (!data.principale) return true;
        return data.categorie.some((c) => c.id === data.principale.id);
      },
      { message: "La categoria principale deve essere una delle categorie del progetto." },
    ),
});

export const collections = { categorie, progetti };
