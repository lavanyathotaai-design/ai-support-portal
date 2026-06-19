import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@supportdesk.com' },
    update: {},
    create: {
      email: 'admin@supportdesk.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  console.log('✅ Test user created:')
  console.log('   Email:    admin@supportdesk.com')
  console.log('   Password: Admin@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())