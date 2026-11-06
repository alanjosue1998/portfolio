/**
 * `Person` structured data for the home page — the shape search engines use
 * for knowledge panels and people search. Every value comes from the database
 * or the dictionary the page already reads, so nothing here is written twice.
 *
 * Kept apart from `app/[lang]/page.tsx` as a plain function so it can be
 * tested without a database.
 */
export type PersonInput = {
  name: string;
  jobTitle: string;
  description: string;
  /** The canonical URL of the page this describes. */
  url: string;
  imageUrl: string | null;
  /** Every contact link; the `mailto:` ones are left out of `sameAs`. */
  links: string[];
  /** "Ibarra, Imbabura" — the city, then the province. */
  place: string;
  /** ISO 3166 code, which is what `addressCountry` asks for. */
  countryCode: string;
  skills: string[];
};

export function personLd(input: PersonInput) {
  const [locality, region] = input.place.split(",").map((part) => part.trim());

  /**
   * `sameAs` is for the same person's profiles elsewhere, which is exactly
   * what the non-mail contact links are. An empty list or a missing image is
   * left out rather than sent empty, which validators flag.
   */
  const sameAs = input.links.filter((link) => !link.startsWith("mailto:"));
  const skills = [...new Set(input.skills)];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    jobTitle: input.jobTitle,
    description: input.description,
    url: input.url,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      ...(region ? { addressRegion: region } : {}),
      addressCountry: input.countryCode,
    },
    ...(skills.length > 0 ? { knowsAbout: skills } : {}),
  };
}

/**
 * The tag's contents. `<` is escaped so a value containing `</script>` cannot
 * close the tag early — the admin writes these values, but the page should not
 * depend on that.
 */
export function serializeLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
