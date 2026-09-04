import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { calculateImeiCheckDigit } from '@tekshir/shared';

const prisma = new PrismaClient();
const secretKey = process.env.SERVER_SECRET_KEY || 'tekshir-imei-hmac-secret-salt-key-999';

function hashImei(imei: string): string {
  return crypto.createHmac('sha256', secretKey).update(imei).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Packages
  await prisma.package.deleteMany();
  const packages = [
    {
      name: '1 ta tekshiruv',
      credits: 1,
      price: 5000,
      sortOrder: 1,
      description: 'Bitta telefonni tezkor tekshirish uchun',
      status: 'ACTIVE',
    },
    {
      name: '5 ta tekshiruv',
      credits: 5,
      price: 20000,
      sortOrder: 2,
      description: 'Bir nechta variant ko‘rayotganlar uchun (20% tejash)',
      status: 'ACTIVE',
    },
    {
      name: '10 ta tekshiruv',
      credits: 10,
      price: 35000,
      sortOrder: 3,
      description: 'Qurilma xarid qiluvchilar uchun eng mashhur paket (30% tejash)',
      status: 'ACTIVE',
    },
    {
      name: '20 ta tekshiruv',
      credits: 20,
      price: 60000,
      sortOrder: 4,
      description: 'Telefon ustaxonasi yoki savdogarlar uchun (40% tejash)',
      status: 'ACTIVE',
    },
  ];

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg });
  }
  console.log('✅ Packages created');

  // 2. Partners
  await prisma.partner.deleteMany();

  const partnerApi = await prisma.partner.create({
    data: {
      name: 'Mobile Gallery (API)',
      integrationType: 'API',
      status: 'ACTIVE',
      apiConfig: {
        create: {
          endpointRef: 'mock://verify?status=DYNAMIC',
          timeoutMs: 3000,
        },
      },
    },
  });

  const partnerCabinet = await prisma.partner.create({
    data: {
      name: 'Texno Savdo (Do‘kon)',
      integrationType: 'CABINET',
      status: 'ACTIVE',
    },
  });

  const partnerCsv = await prisma.partner.create({
    data: {
      name: 'Nasiya Gadgets',
      integrationType: 'CSV',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Partners created');

  // 3. Admin & Partner Users
  await prisma.verificationResult.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const partnerPassword = await bcrypt.hash('partner123', 10);

  const admin = await prisma.user.create({
    data: {
      phone: '+998901234567',
      name: 'Tizim Administratori',
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: adminPassword,
    },
  });

  const partnerUser = await prisma.user.create({
    data: {
      phone: '+998902223344',
      name: 'Texno Savdo Menejeri',
      role: 'PARTNER',
      status: 'ACTIVE',
      partnerId: partnerCabinet.id,
      passwordHash: partnerPassword,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      phone: '+998907778899',
      name: 'Alisher Test',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  // Give test user 10 credits
  await prisma.creditTransaction.create({
    data: {
      userId: testUser.id,
      type: 'PACKAGE_PURCHASE',
      credits: 10,
      balanceAfter: 10,
      referenceType: 'PAYMENT',
      referenceId: 'SEED_INITIAL',
      idempotencyKey: 'SEED-CREDIT-' + testUser.id,
    },
  });
  console.log('✅ Users created with credits');

  // 4. Partner Devices (Initial devices with active installment for testing)
  await prisma.partnerDevice.deleteMany();

  const testImeis = [
    { prefix: '35611111111111', status: 'ACTIVE', partnerId: partnerCabinet.id, source: 'CABINET' },
    { prefix: '35622222222222', status: 'ACTIVE', partnerId: partnerCabinet.id, source: 'CABINET' },
    { prefix: '35633333333333', status: 'PAID', partnerId: partnerCabinet.id, source: 'CABINET' },
    { prefix: '35644444444444', status: 'ACTIVE', partnerId: partnerCsv.id, source: 'CSV' },
  ];

  for (const item of testImeis) {
    const cd = calculateImeiCheckDigit(item.prefix);
    const fullImei = item.prefix + cd;
    const imeiHash = hashImei(fullImei);
    const masked = `**** **** **** ${fullImei.slice(-4)}`;

    await prisma.partnerDevice.create({
      data: {
        partnerId: item.partnerId,
        imeiHash,
        maskedImei: masked,
        status: item.status,
        sourceType: item.source,
      },
    });

    console.log(`📱 Seeded IMEI: ${fullImei} (${item.status}) for Partner: ${item.partnerId}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
