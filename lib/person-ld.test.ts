import { describe, expect, it } from "vitest";

import { personLd, serializeLd } from "./person-ld";

const base = {
  name: "Alan Josué Guamán Rueda",
  jobTitle: "Ingeniero de sistemas enfocado en CMS",
  description: "Sobre mí.",
  url: "https://example.com/es",
  imageUrl: "https://x.public.blob.vercel-storage.com/me.jpg",
  links: ["mailto:me@example.com", "https://github.com/me", "https://linkedin.com/in/me"],
  place: "Ibarra, Imbabura",
  countryCode: "EC",
  skills: ["Drupal", "WordPress", "Drupal"],
};

describe("personLd", () => {
  it("keeps mailto links out of sameAs", () => {
    expect(personLd(base).sameAs).toEqual(["https://github.com/me", "https://linkedin.com/in/me"]);
  });

  it("splits the place into locality and region", () => {
    expect(personLd(base).address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "Ibarra",
      addressRegion: "Imbabura",
      addressCountry: "EC",
    });
  });

  it("lists each skill once", () => {
    expect(personLd(base).knowsAbout).toEqual(["Drupal", "WordPress"]);
  });

  it("leaves out what there is none of rather than sending it empty", () => {
    const ld = personLd({ ...base, imageUrl: null, links: ["mailto:me@example.com"], skills: [] });

    expect(ld).not.toHaveProperty("image");
    expect(ld).not.toHaveProperty("sameAs");
    expect(ld).not.toHaveProperty("knowsAbout");
  });
});

describe("serializeLd", () => {
  it("cannot close the script tag it sits in", () => {
    expect(serializeLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
