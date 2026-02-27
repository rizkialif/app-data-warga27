const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.roles.findMany();
  console.log('Roles in DB:', JSON.stringify(roles, null, 2));
  const users = await prisma.users.findMany({
    include: { roles: true }
  });
  console.log('Users in DB (first 2):', JSON.stringify(users.slice(0, 2), null, 2));
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
