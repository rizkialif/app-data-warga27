import prisma from '../lib/prisma'

export const getAllRt = async () => {
  return await prisma.rt.findMany({
    include: {
      rw: true
    }
  })
}

export const getRtById = async (id) => {
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

export const createRt = async (data) => {
  if (data.nomor_list && Array.isArray(data.nomor_list)) {
    const records = data.nomor_list.map(num => ({
      nomor: Number(num),
      rw_id: Number(data.rw_id)
    }));
    return await prisma.rt.createMany({
      data: records,
      skipDuplicates: true
    });
  }

  return await prisma.rt.create({
    data: {
      nomor: Number(data.nomor),
      rw_id: Number(data.rw_id)
    }
  })
}

export const updateRt = async (id, data) => {
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

export const syncRtByRw = async (rw_id, nomor_list) => {
  const existingRts = await prisma.rt.findMany({ where: { rw_id: Number(rw_id) } });
  const existingNomors = existingRts.map(rt => rt.nomor);
  
  const toAdd = nomor_list.filter(n => !existingNomors.includes(Number(n)));
  const toRemove = existingRts.filter(rt => !nomor_list.map(Number).includes(rt.nomor));

  return await prisma.$transaction(async (tx) => {
    if (toAdd.length > 0) {
      await tx.rt.createMany({
        data: toAdd.map(num => ({
          nomor: Number(num),
          rw_id: Number(rw_id)
        })),
        skipDuplicates: true
      });
    }

    if (toRemove.length > 0) {
      const idsToRemove = toRemove.map(rt => rt.id);
      await tx.rt.deleteMany({
        where: { id: { in: idsToRemove } }
      });
    }

    return { added: toAdd.length, removed: toRemove.length };
  });
}

export const deleteRt = async (id) => {
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
