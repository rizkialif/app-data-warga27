import prisma from '../lib/prisma'

export const getAllRw = async () => {
  return await prisma.rw.findMany()
}

export const getRwById = async (id) => {
  const rw = await prisma.rw.findUnique({
    where: { id: Number(id) }
  })
  
  if (!rw) {
    throw new Error('RW not found')
  }

  return rw
}

export const createRw = async (data) => {
  return await prisma.rw.create({
    data: {
      nomor: Number(data.nomor),
      nama: data.nama
    }
  })
}

export const updateRw = async (id, data) => {
  const rw = await prisma.rw.findUnique({
    where: { id: Number(id) }
  })

  if (!rw) {
    throw new Error('RW not found')
  }

  return await prisma.rw.update({
    where: { id: Number(id) },
    data: {
      nomor: data.nomor ? Number(data.nomor) : undefined,
      nama: data.nama || undefined
    }
  })
}

export const deleteRw = async (id) => {
  const rw = await prisma.rw.findUnique({
    where: { id: Number(id) }
  })

  if (!rw) {
    throw new Error('RW not found')
  }

  return await prisma.rw.delete({
    where: { id: Number(id) }
  })
}
