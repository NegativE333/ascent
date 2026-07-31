import { PrismaClient } from "@prisma/client";
import { SUBJECT_SEED } from "../src/lib/syllabus-seed";

const prisma = new PrismaClient();

async function main() {
  for (const subject of SUBJECT_SEED) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name, displayOrder: subject.displayOrder },
      create: {
        name: subject.name,
        slug: subject.slug,
        displayOrder: subject.displayOrder,
      },
    });
  }
  console.log(`Seeded ${SUBJECT_SEED.length} subjects`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
