const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear old data first (safe to run multiple times)
  await prisma.item.deleteMany();
  await prisma.model.deleteMany();
  await prisma.brand.deleteMany();

  console.log('Old data cleared...');

  // Create 5 Brands
  const khadi      = await prisma.brand.create({ data: { name: 'Khadi' } });
  const sapphire   = await prisma.brand.create({ data: { name: 'Sapphire' } });
  const gulAhmed   = await prisma.brand.create({ data: { name: 'Gul Ahmed' } });
  const outfitters = await prisma.brand.create({ data: { name: 'Outfitters' } });
  const nishat     = await prisma.brand.create({ data: { name: 'Nishat Linen' } });

  console.log('5 Brands created...');

  // Create 10 Models (2 per brand)
  const khadiSummer   = await prisma.model.create({ data: { name: 'Khadi Summer 2024',   brandId: khadi.id } });
  const khadiWinter   = await prisma.model.create({ data: { name: 'Khadi Winter 2024',   brandId: khadi.id } });
  const sapphireLawn  = await prisma.model.create({ data: { name: 'Sapphire Lawn',       brandId: sapphire.id } });
  const sapphirePret  = await prisma.model.create({ data: { name: 'Sapphire Pret',       brandId: sapphire.id } });
  const gulLawn       = await prisma.model.create({ data: { name: 'Gul Ahmed Lawn',      brandId: gulAhmed.id } });
  const gulPremium    = await prisma.model.create({ data: { name: 'Gul Ahmed Premium',   brandId: gulAhmed.id } });
  const outBasic      = await prisma.model.create({ data: { name: 'Outfitters Basic',    brandId: outfitters.id } });
  const outPremium    = await prisma.model.create({ data: { name: 'Outfitters Premium',  brandId: outfitters.id } });
  const nishatLawn    = await prisma.model.create({ data: { name: 'Nishat Lawn',         brandId: nishat.id } });
  const nishatWinter  = await prisma.model.create({ data: { name: 'Nishat Winter',       brandId: nishat.id } });

  console.log('10 Models created...');

  // Create 25 Items
  await prisma.item.createMany({
    data: [
      { name: 'Khadi Summer Shirt Blue',       amount: 1500, brandId: khadi.id,      modelId: khadiSummer.id },
      { name: 'Khadi Summer Kurta White',      amount: 1800, brandId: khadi.id,      modelId: khadiSummer.id },
      { name: 'Khadi Winter Shawl Grey',       amount: 2500, brandId: khadi.id,      modelId: khadiWinter.id },
      { name: 'Khadi Winter Coat Brown',       amount: 3200, brandId: khadi.id,      modelId: khadiWinter.id },
      { name: 'Khadi Cotton Trousers',         amount: 1200, brandId: khadi.id },

      { name: 'Sapphire Lawn 3PC Green',       amount: 3500, brandId: sapphire.id,   modelId: sapphireLawn.id },
      { name: 'Sapphire Lawn 2PC Pink',        amount: 2800, brandId: sapphire.id,   modelId: sapphireLawn.id },
      { name: 'Sapphire Pret Kurti Black',     amount: 2200, brandId: sapphire.id,   modelId: sapphirePret.id },
      { name: 'Sapphire Pret Dress Navy',      amount: 2600, brandId: sapphire.id,   modelId: sapphirePret.id },
      { name: 'Sapphire Accessories Bag',      amount: 1900, brandId: sapphire.id },

      { name: 'Gul Ahmed Lawn Suit Red',       amount: 3100, brandId: gulAhmed.id,   modelId: gulLawn.id },
      { name: 'Gul Ahmed Lawn Embroidered',    amount: 3800, brandId: gulAhmed.id,   modelId: gulLawn.id },
      { name: 'Gul Ahmed Premium Silk',        amount: 5500, brandId: gulAhmed.id,   modelId: gulPremium.id },
      { name: 'Gul Ahmed Premium Chiffon',     amount: 4800, brandId: gulAhmed.id,   modelId: gulPremium.id },
      { name: 'Gul Ahmed Cotton Dupatta',      amount: 900,  brandId: gulAhmed.id },

      { name: 'Outfitters Basic Tshirt White', amount: 1100, brandId: outfitters.id, modelId: outBasic.id },
      { name: 'Outfitters Basic Jeans Blue',   amount: 2900, brandId: outfitters.id, modelId: outBasic.id },
      { name: 'Outfitters Premium Jacket',     amount: 5200, brandId: outfitters.id, modelId: outPremium.id },
      { name: 'Outfitters Premium Hoodie',     amount: 3400, brandId: outfitters.id, modelId: outPremium.id },
      { name: 'Outfitters Casual Shorts',      amount: 1600, brandId: outfitters.id },

      { name: 'Nishat Lawn 3PC Yellow',        amount: 3300, brandId: nishat.id,     modelId: nishatLawn.id },
      { name: 'Nishat Lawn Printed 2PC',       amount: 2700, brandId: nishat.id,     modelId: nishatLawn.id },
      { name: 'Nishat Winter Shawl Maroon',    amount: 2100, brandId: nishat.id,     modelId: nishatWinter.id },
      { name: 'Nishat Winter Suit Camel',      amount: 4100, brandId: nishat.id,     modelId: nishatWinter.id },
      { name: 'Nishat Linen Dupatta White',    amount: 850,  brandId: nishat.id },
    ],
  });

  console.log('25 Items created...');
  console.log('✅ Seed complete! 5 brands | 10 models | 25 items');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());