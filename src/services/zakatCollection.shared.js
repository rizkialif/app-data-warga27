import prisma from '@/lib/prisma'

export const getAllCollections = async () => {
  return await prisma.zakat_collection.findMany({
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

export const getCollectionSummary = async () => {
  const result = await prisma.zakat_collection.groupBy({
    by: ['jenis_zakat'],
    _sum: {
      jumlah_bayar: true,
    },
  });

  const summary = {
    uang: 0,
    beras: 0
  };

  result.forEach(item => {
    if (item.jenis_zakat === 'uang') {
      summary.uang = item._sum.jumlah_bayar ? parseFloat(item._sum.jumlah_bayar) : 0;
    } else if (item.jenis_zakat === 'beras') {
      summary.beras = item._sum.jumlah_bayar ? parseFloat(item._sum.jumlah_bayar) : 0;
    }
  });

  return summary;
}

export const createCollection = async (data) => {
  return await prisma.zakat_collection.create({
    data: {
      resident_id: data.resident_id,
      jenis_zakat: data.jenis_zakat,
      jumlah_bayar: data.jumlah_bayar,
      nama_keluarga_dibayar: data.nama_keluarga_dibayar,
      nama_petugas: data.nama_petugas
    },
    include: {
      resident: true
    }
  })
}

export const updateCollection = async (id, data) => {
  return await prisma.zakat_collection.update({
    where: { id: parseInt(id) },
    data: {
      jenis_zakat: data.jenis_zakat,
      jumlah_bayar: data.jumlah_bayar,
      nama_keluarga_dibayar: data.nama_keluarga_dibayar,
      nama_petugas: data.nama_petugas
    },
    include: {
      resident: true
    }
  })
}

export const deleteCollection = async (id) => {
  return await prisma.zakat_collection.delete({
    where: { id: parseInt(id) }
  })
}
