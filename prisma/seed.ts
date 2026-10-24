import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not configured.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const specialties = [
  {
    name: "General Medicine",
    description: "General health assessments and primary medical care.",
  },
  {
    name: "Cardiology",
    description: "Heart and cardiovascular health.",
  },
  {
    name: "Dermatology",
    description: "Skin, hair, and nail conditions.",
  },
  {
    name: "Pediatrics",
    description: "Healthcare for infants, children, and adolescents.",
  },
  {
    name: "Neurology",
    description: "Conditions affecting the brain, spinal cord, and nerves.",
  },
  {
    name: "Orthopedics",
    description: "Bone, joint, muscle, and musculoskeletal conditions.",
  },
  {
    name: "Gynecology",
    description: "Women's reproductive health.",
  },
  {
    name: "Ophthalmology",
    description: "Eye health and vision care.",
  },
  {
    name: "Psychiatry",
    description: "Mental health assessment and treatment.",
  },
  {
    name: "Dentistry",
    description: "Oral health and dental care.",
  },
];

async function main() {
  for (const specialty of specialties) {
    await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: { description: specialty.description },
      create: specialty,
    });
  }

  console.log(`Seeded ${specialties.length} medical specialties.`);
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed specialties:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });