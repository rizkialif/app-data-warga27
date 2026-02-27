const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Truncating tables: RefreshToken, users...')
    
    // Disable FK checks to allow truncate
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`)
    
    // Truncate tables (resets ID)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE RefreshToken;`)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE users;`)
    
    // Enable FK checks
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`)
    
    console.log('✅ Tables truncated successfully.')
  } catch (error) {
    console.error('❌ Failed to truncate tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
