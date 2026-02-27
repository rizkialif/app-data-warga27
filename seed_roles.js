const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultMenus = [
  'menu:master-data', 'menu:rt', 'menu:rw', 'menu:roles', 'menu:permissions',
  'menu:resident-data', 'menu:family', 'menu:warga', 'menu:users',
  'menu:zakat' // Adding Zakat menu explicitly
];

const allPermissionsDict = [
  // Menus
  { code: 'menu:master-data', name: 'Menu Master Data', description: 'Akses menu Master Data' },
  { code: 'menu:rt', name: 'Menu Data RT', description: 'Akses view Data RT' },
  { code: 'menu:rw', name: 'Menu Data RW', description: 'Akses view Data RW' },
  { code: 'menu:roles', name: 'Menu Data Roles', description: 'Akses view Data Roles' },
  { code: 'menu:permissions', name: 'Menu Data Permissions', description: 'Akses view Data Permissions' },
  { code: 'menu:resident-data', name: 'Menu Resident Data', description: 'Akses menu Resident Data' },
  { code: 'menu:family', name: 'Menu Data Keluarga', description: 'Akses view Data Kepala Keluarga' },
  { code: 'menu:warga', name: 'Menu Data Warga', description: 'Akses view Data Warga' },
  { code: 'menu:users', name: 'Menu Users', description: 'Akses view Users' },
  { code: 'menu:zakat', name: 'Menu Zakat', description: 'Akses view Zakat' },

  // Actions RT
  { code: 'action:create:rt', name: 'Tambah RT', description: 'Bisa menambah data RT' },
  { code: 'action:update:rt', name: 'Edit RT', description: 'Bisa mengubah data RT' },
  { code: 'action:delete:rt', name: 'Hapus RT', description: 'Bisa menghapus data RT' },

  // Actions RW
  { code: 'action:create:rw', name: 'Tambah RW', description: 'Bisa menambah data RW' },
  { code: 'action:update:rw', name: 'Edit RW', description: 'Bisa mengubah data RW' },
  { code: 'action:delete:rw', name: 'Hapus RW', description: 'Bisa menghapus data RW' },

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

  // Actions Zakat
  { code: 'action:create:zakat', name: 'Tambah Zakat', description: 'Bisa menambah data Zakat' },
  { code: 'action:update:zakat', name: 'Edit Zakat', description: 'Bisa mengubah data Zakat' },
  { code: 'action:delete:zakat', name: 'Hapus Zakat', description: 'Bisa menghapus data Zakat' },
];

const rolesToSeed = [
  {
    code: 'ketua_rt',
    name: 'Ketua RT',
    description: 'Bisa view semua menu, tanpa CRUD',
    permissions: [
      'menu:master-data', 'menu:rt', 'menu:rw',
      'menu:resident-data', 'menu:family', 'menu:warga',
      'menu:users'
    ]
  },
  {
    code: 'ketua_rw',
    name: 'Ketua RW',
    description: 'Bisa CRUD di master data RT, tapi view saja di RW',
    permissions: [
      'menu:master-data', 'menu:rt', 'menu:rw',
      'menu:resident-data', 'menu:family', 'menu:warga',
      'menu:users',
      // CRUD untuk RT
      'action:create:rt', 'action:update:rt', 'action:delete:rt',
    ]
  },
  {
    code: 'panitia_zakat',
    name: 'Panitia Zakat',
    description: 'CRUD di menu zakat, menu lain hanya view',
    permissions: [
      'menu:master-data', 'menu:rt', 'menu:rw',
      'menu:resident-data', 'menu:family', 'menu:warga',
      'menu:users',
      'menu:zakat',
      // CRUD untuk Zakat
      'action:create:zakat', 'action:update:zakat', 'action:delete:zakat'
    ]
  }
];

async function main() {
  console.log('--- Database Seeding for Roles and Permissions ---');

  // 1. Ensure all standard permissions exist
  console.log('Inserting all permission codes into database...');
  for (const p of allPermissionsDict) {
    await prisma.permissions.upsert({
      where: { code: p.code },
      update: { name: p.name, description: p.description },
      create: p,
    });
  }

  // 2. Ensure roles exist and assign permissions
  for (const roleDef of rolesToSeed) {
    console.log(`Processing Role: ${roleDef.name} (${roleDef.code})...`);
    
    // Ensure Role exists
    await prisma.roles.upsert({
      where: { code: roleDef.code },
      update: { name: roleDef.name, description: roleDef.description },
      create: { 
        code: roleDef.code, 
        name: roleDef.name, 
        description: roleDef.description 
      },
    });

    // Clear existing permissions for this role to make sure it precisely matches defining list
    await prisma.role_permissions.deleteMany({
      where: { role_code: roleDef.code }
    });

    // Assign new permissions
    for (const permCode of roleDef.permissions) {
      await prisma.role_permissions.create({
        data: {
          role_code: roleDef.code,
          permission_code: permCode
        }
      });
    }
    
    console.log(` > Assigned ${roleDef.permissions.length} permissions to ${roleDef.code}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
