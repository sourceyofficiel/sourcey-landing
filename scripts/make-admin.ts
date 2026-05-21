/**
 * Promouvoir un user en admin via son email.
 *
 * Usage :
 *   npm run make-admin -- ton@email.com
 *
 * (le script lit DATABASE_URL depuis .env)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.toLowerCase().trim();
  if (!email) {
    console.error("❌ Email manquant. Usage : npm run make-admin -- ton@email.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ Aucun user trouvé avec l'email "${email}".`);
    console.error("   Crée d'abord ton compte via /signup puis relance.");
    process.exit(1);
  }

  if (user.isAdmin) {
    console.log(`✅ ${email} est déjà admin.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: true },
  });

  console.log(`✅ ${email} est maintenant admin.`);
  console.log(`   Connecte-toi puis va sur /admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
