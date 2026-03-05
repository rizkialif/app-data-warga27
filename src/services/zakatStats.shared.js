import prisma from '../lib/prisma';

export const getZakatDashboardStats = async () => {
  try {
    // 1. Total Recipients (Mustahik)
    const totalRecipients = await prisma.zakat_recipient.count();

    // 2. Total Muzakki (Collections)
    const totalCollections = await prisma.zakat_collection.count();

    // 3. Total Beras vs Total Uang
    const collections = await prisma.zakat_collection.findMany({
      select: {
        jenis_zakat: true,
        jumlah_bayar: true,
      }
    });

    let totalUang = 0;
    let totalBeras = 0;

    collections.forEach((c) => {
      if (c.jenis_zakat === 'uang') {
        totalUang += Number(c.jumlah_bayar);
      } else if (c.jenis_zakat === 'beras') {
        totalBeras += Number(c.jumlah_bayar);
      }
    });

    // 4. Muzakki Composition (Uang vs Beras by count)
    const countByType = await prisma.zakat_collection.groupBy({
      by: ['jenis_zakat'],
      _count: {
        id: true,
      },
    });

    const compositionCount = {
      uang: 0,
      beras: 0
    };

    countByType.forEach((item) => {
      compositionCount[item.jenis_zakat] = item._count.id;
    });

    // 5. Mustahik Distribution (by Asnaf)
    const recipientsByKategori = await prisma.zakat_recipient.groupBy({
      by: ['kategori'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return {
      overview: {
        totalRecipients,
        totalCollections,
        totalUang,
        totalBeras
      },
      charts: {
        collectionComposition: [
          { type: 'Uang', value: compositionCount.uang },
          { type: 'Beras', value: compositionCount.beras }
        ],
        recipientDistribution: recipientsByKategori.map((r) => ({
          type: r.kategori.charAt(0).toUpperCase() + r.kategori.slice(1),
          value: r._count.id
        }))
      }
    };
  } catch (error) {
    console.error("Error in getZakatDashboardStats:", error);
    throw error;
  }
};
