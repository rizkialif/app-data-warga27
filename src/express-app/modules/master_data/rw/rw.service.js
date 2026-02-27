const prisma = require('../../../../config/prisma')

exports.getAllRw = async () => {
  return await prisma.rw.findMany()
}

exports.getRwById = async (id) => {
  const rw = await prisma.rw.findUnique({
    where: { id: Number(id) }
  })
  
  if (!rw) {
    throw new Error('RW not found')
  }

  return rw
}

exports.createRw = async (data) => {
  return await prisma.rw.create({
    data: {
      nomor: Number(data.nomor),
      nama: data.nama
    }
  })
}

exports.updateRw = async (id, data) => {
  const rw = await prisma.rw.findUnique({
    where: { id: Number(id) }
  })

  if (!rw) {
    throw new Error('RW not found')
  }

  return await prisma.rw.update({
    where: { id: Number(id) },
    data: {
      nomor: Number(data.nomor),
      nama: data.nama
    }
  })
}

exports.deleteRw = async (id) => {
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
