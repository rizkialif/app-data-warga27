const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissionsToSeed = [
  // Menus
  { code: 'menu:master-data', name: 'Menu Master Data', description: 'Akses menu Master Data' },
  { code: 'menu:rt', name: 'Menu Data RT', description: 'Akses menu Data RT' },
  { code: 'menu:rw', name: 'Menu Data RW', description: 'Akses menu Data RW' },
  { code: 'menu:roles', name: 'Menu Data Roles', description: 'Akses menu Data Roles' },
  { code: 'menu:permissions', name: 'Menu Data Permissions', description: 'Akses menu Data Permissions' },
  { code: 'menu:resident-data', name: 'Menu Resident Data', description: 'Akses menu Resident Data' },
  { code: 'menu:family', name: 'Menu Data Keluarga', description: 'Akses menu Data Kepala Keluarga' },
  { code: 'menu:warga', name: 'Menu Data Warga', description: 'Akses menu Data Warga' },
  { code: 'menu:users', name: 'Menu Users', description: 'Akses menu Users' },

  // Actions RT
  { code: 'action:create:rt', name: 'Tambah RT', description: 'Bisa menambah data RT' },
  { code: 'action:update:rt', name: 'Edit RT', description: 'Bisa mengubah data RT' },
  { code: 'action:delete:rt', name: 'Hapus RT', description: 'Bisa menghapus data RT' },

  // Actions RW
  { code: 'action:create:rw', name: 'Tambah RW', description: 'Bisa menambah data RW' },
  { code: 'action:update:rw', name: 'Edit RW', description: 'Bisa mengubah data RW' },
  { code: 'action:delete:rw', name: 'Hapus RW', description: 'Bisa menghapus data RW' },

  // Actions Roles (optional)
  { code: 'action:create:roles', name: 'Tambah Roles', description: '' },
  { code: 'action:update:roles', name: 'Edit Roles', description: '' },
  { code: 'action:delete:roles', name: 'Hapus Roles', description: '' },

  // Actions Permissions (optional)
  { code: 'action:create:permissions', name: 'Tambah Permissions', description: '' },
  { code: 'action:update:permissions', name: 'Edit Permissions', description: '' },
  { code: 'action:delete:permissions', name: 'Hapus Permissions', description: '' },

  // Actions Family
  { code: 'action:create:family', name: 'Tambah Keluarga', description: 'Bisa menambah data Keluarga' },
  { code: 'action:update:family', name: 'Edit Keluarga', description: 'Bisa mengubah data Keluarga' },
  { code: 'action:delete:family', name: 'Hapus Keluarga', description: 'Bisa menghapus data Keluarga' },
  { code: 'action:export:family', name: 'Export Keluarga', description: 'Bisa export data Keluarga' },

  // Actions Warga
  { code: 'action:create:warga', name: 'Tambah Warga', description: 'Bisa menambah data Warga' },
  { code: 'action:update:warga', name: 'Edit Warga', description: 'Bisa mengubah data Warga' },
  { code: 'action:delete:warga', name: 'Hapus Warga', description: 'Bisa menghapus data Warga' },
  { code: 'action:export:warga', name: 'Export Warga', description: 'Bisa export data Warga' },
  
  // Actions Users (optional)
  { code: 'action:create:users', name: 'Tambah Users', description: '' },
  { code: 'action:update:users', name: 'Edit Users', description: '' },
  { code: 'action:delete:users', name: 'Hapus Users', description: '' },
];

async function main() {
  console.log('Seeding permissions...');
  
  // Insert permissions
  for (const p of permissionsToSeed) {
    await prisma.permissions.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log('Assigning to admin role...');
  
  // Assign to admin role
  const adminRole = await prisma.roles.findUnique({ where: { code: 'admin' } });
  
  if (adminRole) {
    for (const p of permissionsToSeed) {
      await prisma.role_permissions.upsert({
        // Upsert by a compound unique or just check first
        where: {
          role_code_permission_code: {
            role_code: 'admin',
            permission_code: p.code
          }
        },
        update: {},
        create: {
          role_code: 'admin',
          permission_code: p.code
        }
      });
    }
    console.log('Admin role seeded successfully!');
  } else {
    console.log('Admin role not found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
