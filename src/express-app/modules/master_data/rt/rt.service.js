const prisma = require('../../../../config/prisma')

exports.getAllRt = async () => {
  return await prisma.rt.findMany({
    include: {
      rw: true
    }
  })
}

exports.getRtById = async (id) => {
  const rt = await prisma.rt.findUnique({
    where: { id: Number(id) },
    include: {
      rw: true
    }
  })
  
  if (!rt) {
    throw new Error('RT not found')
  }

  return rt
}

exports.createRt = async (data) => {
  return await prisma.rt.create({
    data: {
      nomor: Number(data.nomor),
      rw_id: Number(data.rw_id)
    }
  })
}

exports.updateRt = async (id, data) => {
  const rt = await prisma.rt.findUnique({
    where: { id: Number(id) }
  })

  if (!rt) {
    throw new Error('RT not found')
  }

  return await prisma.rt.update({
    where: { id: Number(id) },
    data: {
      nomor: data.nomor ? Number(data.nomor) : undefined,
      rw_id: data.rw_id ? Number(data.rw_id) : undefined
    }
  })
}

exports.deleteRt = async (id) => {
  const rt = await prisma.rt.findUnique({
    where: { id: Number(id) }
  })

  if (!rt) {
    throw new Error('RT not found')
  }

  return await prisma.rt.delete({
    where: { id: Number(id) }
  })
}
