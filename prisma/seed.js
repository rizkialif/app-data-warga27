const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Create Roles
  const roleAdmin = await prisma.roles.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      code: 'admin',
      name: 'Administrator',
      description: 'Administrator System'
    }
  })

  console.log({ roleAdmin })

  // 2. Create User
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const userAdmin = await prisma.users.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      nama: 'Admin System',
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role_code: roleAdmin.code,
      status: 'aktif'
    }
  })

  console.log({ userAdmin })

  console.log({ userAdmin })

  // 3. Seed RW (1-32) and RT (1-10 per RW)
  console.log('Seeding RW and RT...')
  
  for (let i = 1; i <= 32; i++) {
    const rwNomor = i
    const rwNama = `RW ${i.toString().padStart(3, '0')}`

    // Check if RW exists by nomor
    let rw = await prisma.rw.findFirst({
      where: { nomor: rwNomor }
    })

    if (!rw) {
      rw = await prisma.rw.create({
        data: {
          nomor: rwNomor,
          nama: rwNama
        }
      })
      console.log(`Created ${rwNama}`)
    } else {
      // optional: update name if needed
    }

    // Seed RT 1-10 for this RW
    for (let j = 1; j <= 10; j++) {
      const rtNomor = j
      
      const rtExists = await prisma.rt.findFirst({
        where: {
          nomor: rtNomor,
          rw_id: rw.id
        }
      })

      if (!rtExists) {
        await prisma.rt.create({
          data: {
            nomor: rtNomor,
            rw_id: rw.id
          }
        })
        // console.log(`  Created RT ${rtNomor} for ${rwNama}`)
      }
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
