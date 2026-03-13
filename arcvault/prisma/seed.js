const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { slug: "engineering" },
      update: {},
      create: { name: "Engineering", slug: "engineering" },
    }),
    prisma.department.upsert({
      where: { slug: "billing" },
      update: {},
      create: { name: "Billing", slug: "billing" },
    }),
    prisma.department.upsert({
      where: { slug: "product" },
      update: {},
      create: { name: "Product", slug: "product" },
    }),
    prisma.department.upsert({
      where: { slug: "it-security" },
      update: {},
      create: { name: "IT/Security", slug: "it-security" },
    }),
  ]);

  console.log("✅ Departments created");

  await prisma.user.upsert({
    where: { email: "regulator@arcvault.io" },
    update: {},
    create: {
      email: "regulator@arcvault.io",
      passwordHash: await bcrypt.hash("regulator123", 10),
      name: "Regulator",
      role: "REGULATOR",
    },
  });

  console.log("✅ Regulator created");

  await prisma.user.upsert({
    where: { email: "customer@arcvault.io" },
    update: {},
    create: {
      email: "customer@arcvault.io",
      passwordHash: await bcrypt.hash("customer123", 10),
      name: "John Smith",
      role: "CUSTOMER",
      departmentId: null,
    },
  });

  console.log("✅ Customer created");

  const departmentUsers = [
    { email: "engineering@arcvault.io", name: "Engineering Team", slug: "engineering" },
    { email: "billing@arcvault.io", name: "Billing Team", slug: "billing" },
    { email: "product@arcvault.io", name: "Product Team", slug: "product" },
    { email: "itsecurity@arcvault.io", name: "IT/Security Team", slug: "it-security" },
  ];

  for (const user of departmentUsers) {
    const department = departments.find((d) => d.slug === user.slug);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash: await bcrypt.hash("department123", 10),
        name: user.name,
        role: "DEPARTMENT",
        departmentId: department.id,
      },
    });
  }

  console.log("✅ Department users created");

  const engineering = await prisma.department.findUnique({ where: { slug: "engineering" } });
  const billing = await prisma.department.findUnique({ where: { slug: "billing" } });
  const product = await prisma.department.findUnique({ where: { slug: "product" } });

  const sampleRequests = [];

  for (const sample of sampleRequests) {
    const request = await prisma.request.create({
      data: {
        source: sample.source,
        rawMessage: sample.rawMessage,
      },
    });

    await prisma.processedRecord.create({
      data: {
        requestId: request.id,
        ...sample.record,
        identifiers: sample.record.identifiers,
      },
    });
  }

  console.log("✅ Sample records created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });