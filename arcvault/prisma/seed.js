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

  const sampleRequests = [
    {
      source: "EMAIL",
      rawMessage: "Hi, I tried logging in this morning and keep getting a 403 error. My account is arcvault.io/user/jsmith. This started after your update last Tuesday.",
      record: {
        category: "BUG_REPORT",
        priority: "HIGH",
        confidence: 0.92,
        coreIssue: "User receiving 403 error after recent platform update",
        identifiers: { accountId: "arcvault.io/user/jsmith", errorCode: "403" },
        urgencySignal: "Blocking login, started after update",
        departmentId: engineering.id,
        routingReason: "Login error likely caused by engineering update",
        escalationFlag: false,
        status: "AUTO_ROUTED",
        summary: "User jsmith is unable to log in due to a 403 error that appeared after last Tuesday's update. This is a high-priority bug likely introduced in the recent deployment. Routed to Engineering for immediate investigation.",
      },
    },
    {
      source: "WEB_FORM",
      rawMessage: "We'd love to see a bulk export feature for our audit logs. We're a compliance-heavy org and this would save us hours every month.",
      record: {
        category: "FEATURE_REQUEST",
        priority: "MEDIUM",
        confidence: 0.88,
        coreIssue: "Customer requesting bulk export feature for audit logs",
        identifiers: {},
        urgencySignal: "Compliance requirement, monthly time savings",
        departmentId: product.id,
        routingReason: "Feature request routed to Product for backlog consideration",
        escalationFlag: false,
        status: "AUTO_ROUTED",
        summary: "A compliance-focused organization is requesting a bulk export feature for audit logs. This would save significant manual effort each month. Routed to Product for evaluation and backlog prioritization.",
      },
    },
    {
      source: "SUPPORT_PORTAL",
      rawMessage: "Invoice #8821 shows a charge of $1,240 but our contract rate is $980/month. Can someone look into this?",
      record: {
        category: "BILLING_ISSUE",
        priority: "HIGH",
        confidence: 0.95,
        coreIssue: "Invoice overcharge of $260 above contracted rate",
        identifiers: { invoiceNumber: "8821" },
        urgencySignal: "Billing discrepancy above $500 threshold",
        departmentId: null,
        routingReason: null,
        escalationFlag: true,
        escalationReason: "billing_threshold",
        status: "PENDING_REVIEW",
        summary: "Customer reports invoice #8821 shows $1,240 but their contracted rate is $980/month — a $260 overcharge. Escalated for human review due to billing discrepancy exceeding the $500 threshold.",
      },
    },
    {
      source: "EMAIL",
      rawMessage: "I'm not sure if this is the right place to ask, but is there a way to set up SSO with Okta? We're evaluating switching our auth provider.",
      record: {
        category: "TECHNICAL_QUESTION",
        priority: "LOW",
        confidence: 0.61,
        coreIssue: "Customer asking about Okta SSO integration",
        identifiers: {},
        urgencySignal: "Evaluation phase, no urgency",
        departmentId: null,
        routingReason: null,
        escalationFlag: true,
        escalationReason: "low_confidence",
        status: "PENDING_REVIEW",
        summary: "Customer is evaluating switching their auth provider and wants to know if Okta SSO is supported. Low confidence score triggered human review. Needs routing to IT/Security or Product depending on current SSO support status.",
      },
    },
    {
      source: "WEB_FORM",
      rawMessage: "Your dashboard stopped loading for us around 2pm EST. Checked our end — it's definitely on yours. Multiple users affected.",
      record: {
        category: "INCIDENT_OUTAGE",
        priority: "HIGH",
        confidence: 0.97,
        coreIssue: "Dashboard outage affecting multiple users since 2pm EST",
        identifiers: {},
        urgencySignal: "Active outage, multiple users affected",
        departmentId: engineering.id,
        routingReason: "Active outage routed to Engineering for immediate response",
        escalationFlag: true,
        escalationReason: "keyword_match",
        status: "MANUALLY_ROUTED",
        summary: "Multiple users are experiencing a complete dashboard outage that started around 2pm EST. The customer has confirmed it is not on their end. Escalated and manually routed to Engineering for urgent investigation.",
      },
    },
  ];

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