import prisma from '../lib/prisma'

export const getAllFamilies = async () => {
  return await prisma.family.findMany({
    include: {
      rt: {
        include: {
          rw: true
        }
      },
      resident: {
        where: {
          status_dalam_keluarga: 'kepala_keluarga'
        },
        take: 1
      },
      _count: {
        select: { resident: true }
      }
    }
  })
}

export const getFamilyById = async (id) => {
  const family = await prisma.family.findUnique({
    where: { id: Number(id) },
    include: {
      rt: {
        include: {
          rw: true
        }
      },
      resident: true
    }
  })
  
  if (!family) {
    throw new Error('Family not found')
  }

  return family
}

export const createFamily = async (data) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the family record
    const family = await tx.family.create({
      data: {
        no_kk: data.no_kk,
        alamat: data.alamat,
        rt_id: Number(data.rt_id),
        status: data.status || 'aktif'
      }
    })

    // 2. Create the head of family as an initial resident record
    if (data.nama_kepala && data.nik_kepala) {
      await tx.resident.create({
        data: {
          family_id: family.id,
          nik: data.nik_kepala,
          nama: data.nama_kepala,
          jenis_kelamin: data.jenis_kelamin_kepala || 'L',
          status_dalam_keluarga: 'kepala_keluarga',
          status_warga: 'aktif'
        }
      })
    }

    return family
  })
}

export const updateFamily = async (id, data) => {
  const family = await prisma.family.findUnique({
    where: { id: Number(id) }
  })

  if (!family) {
    throw new Error('Family not found')
  }

  return await prisma.family.update({
    where: { id: Number(id) },
    data: {
      no_kk: data.no_kk || undefined,
      alamat: data.alamat || undefined,
      rt_id: data.rt_id ? Number(data.rt_id) : undefined,
      status: data.status || undefined
    }
  })
}

export const deleteFamily = async (id) => {
  const family = await prisma.family.findUnique({
    where: { id: Number(id) }
  })

  if (!family) {
    throw new Error('Family not found')
  }

  return await prisma.family.delete({
    where: { id: Number(id) }
  })
}
