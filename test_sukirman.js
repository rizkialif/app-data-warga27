const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const u = await prisma.users.findUnique({
    where: { username: 'sukirman' },
    include: {
      roles: {
        include: {
          role_permissions: true
        }
      }
    }
  });

  console.log('User Role:', u?.role_code);
  console.log('Permissions:', u?.roles?.role_permissions?.map(p => p.permission_code));
}

check().finally(() => prisma.$disconnect());
