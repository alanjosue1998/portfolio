// The seed runs as its own process, so it loads `.env` itself.
import "dotenv/config";

import prisma from "../lib/prisma";

/**
 * The projects the site used to read from the dictionaries. Keyed by title so the
 * seed can be re-run without duplicating rows.
 */
const projects = [
  {
    title: "Corporate site in Drupal",
    type: "Drupal",
    description: "A fast site the team can manage on its own.",
    technologies: ["Drupal", "PHP", "Twig"],
  },
  {
    title: "WordPress store",
    type: "WordPress",
    description: "An e-commerce site built with WordPress.",
    technologies: ["WordPress", "PHP", "ACF"],
  },
];

async function main() {
  for (const project of projects) {
    const existing = await prisma.project.findFirst({
      where: { title: project.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data: project });
    } else {
      await prisma.project.create({ data: project });
    }
  }

  console.log(`Seeded ${projects.length} projects.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
