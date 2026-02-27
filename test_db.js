const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.roles.findUnique({
    where: { code: 'admin' },
    include: {
      role_permissions: true
    }
  });
  console.log("Admin Role:", JSON.stringify(adminRole, null, 2));

  const allPermissions = await prisma.permissions.findMany();
  console.log("All Permissions:", JSON.stringify(allPermissions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
