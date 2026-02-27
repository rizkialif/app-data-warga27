import prisma from '@/lib/prisma'

export const getAllRecipients = async () => {
  return await prisma.zakat_recipient.findMany({
    include: {
      resident: {
        include: {
          family: {
            include: {
              rt: {
                include: {
                  rw: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })
}

export const createRecipient = async (data) => {
  // Validate if resident already exists as recipient
  const existing = await prisma.zakat_recipient.findFirst({
    where: { resident_id: data.resident_id }
  })
  
  if (existing) {
    throw new Error('Warga ini sudah terdaftar sebagai penerima zakat')
  }

  return await prisma.zakat_recipient.create({
    data: {
      resident_id: data.resident_id,
      kategori: data.kategori
    },
    include: {
      resident: true
    }
  })
}

export const updateRecipient = async (id, data) => {
  return await prisma.zakat_recipient.update({
    where: { id: parseInt(id) },
    data: {
      kategori: data.kategori
    },
    include: {
      resident: true
    }
  })
}

export const deleteRecipient = async (id) => {
  return await prisma.zakat_recipient.delete({
    where: { id: parseInt(id) }
  })
}
