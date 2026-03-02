import prisma from '../lib/prisma'

export const getAllKetuaRw = async () => {
  return await prisma.ketua_rw.findMany({
    include: {
      rw: true
    }
  })
}

export const getKetuaRwById = async (id) => {
  const ketuaRw = await prisma.ketua_rw.findUnique({
    where: { id: Number(id) },
    include: {
      rw: true
    }
  })
  
  if (!ketuaRw) {
    throw new Error('Ketua RW not found')
  }

  return ketuaRw
}

export const createKetuaRw = async (data) => {
  return await prisma.ketua_rw.create({
    data: {
      rw_id: Number(data.rw_id),
      nama: data.nama
    }
  })
}

export const updateKetuaRw = async (id, data) => {
  const ketuaRw = await prisma.ketua_rw.findUnique({
    where: { id: Number(id) }
  })

  if (!ketuaRw) {
    throw new Error('Ketua RW not found')
  }

  return await prisma.ketua_rw.update({
    where: { id: Number(id) },
    data: {
      rw_id: data.rw_id ? Number(data.rw_id) : undefined,
      nama: data.nama || undefined
    }
  })
}

export const deleteKetuaRw = async (id) => {
  const ketuaRw = await prisma.ketua_rw.findUnique({
    where: { id: Number(id) }
  })

  if (!ketuaRw) {
    throw new Error('Ketua RW not found')
  }

  return await prisma.ketua_rw.delete({
    where: { id: Number(id) }
  })
}
