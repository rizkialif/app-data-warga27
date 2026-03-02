import prisma from '../lib/prisma'

export const getAllKetuaRt = async () => {
  return await prisma.ketua_rt.findMany({
    include: {
      rt: {
        include: {
          rw: true
        }
      }
    }
  })
}

export const getKetuaRtById = async (id) => {
  const ketuaRt = await prisma.ketua_rt.findUnique({
    where: { id: Number(id) },
    include: {
      rt: {
        include: {
          rw: true
        }
      }
    }
  })
  
  if (!ketuaRt) {
    throw new Error('Ketua RT not found')
  }

  return ketuaRt
}

export const createKetuaRt = async (data) => {
  return await prisma.ketua_rt.create({
    data: {
      rt_id: Number(data.rt_id),
      nama: data.nama
    }
  })
}

export const updateKetuaRt = async (id, data) => {
  const ketuaRt = await prisma.ketua_rt.findUnique({
    where: { id: Number(id) }
  })

  if (!ketuaRt) {
    throw new Error('Ketua RT not found')
  }

  return await prisma.ketua_rt.update({
    where: { id: Number(id) },
    data: {
      rt_id: data.rt_id ? Number(data.rt_id) : undefined,
      nama: data.nama || undefined
    }
  })
}

export const deleteKetuaRt = async (id) => {
  const ketuaRt = await prisma.ketua_rt.findUnique({
    where: { id: Number(id) }
  })

  if (!ketuaRt) {
    throw new Error('Ketua RT not found')
  }

  return await prisma.ketua_rt.delete({
    where: { id: Number(id) }
  })
}
