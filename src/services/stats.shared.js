import prisma from '../lib/prisma'

export const getResidentStatsByRw = async () => {
  // Get all RWs to ensure we include those with 0 residents
  const allRw = await prisma.rw.findMany({
    orderBy: { nomor: 'asc' }
  })

  // Group residents by RW
  const stats = await prisma.rw.findMany({
    select: {
      nomor: true,
      rt: {
        select: {
          family: {
            select: {
              _count: {
                select: { resident: true }
              }
            }
          }
        }
      }
    },
    orderBy: { nomor: 'asc' }
  })

  const formattedStats = stats.map(rw => {
    let totalResidents = 0
    rw.rt.forEach(rt => {
      rt.family.forEach(fam => {
        totalResidents += fam._count.resident
      })
    })

    return {
      rw: `RW ${String(rw.nomor).padStart(2, '0')}`,
      count: totalResidents
    }
  })

  return formattedStats
}

export const getDashboardSummary = async () => {
  try {
    const rawResidents = await prisma.resident.findMany({
      select: {
        jenis_kelamin: true,
        agama: true,
        tanggal_lahir: true,
        status_warga: true
      },
      where: {
        status_warga: 'aktif'
      }
    });

    // Counts
    const totalFamilies = await prisma.family.count({ where: { status: 'aktif' } });
    const totalRw = await prisma.rw.count();
    const totalRt = await prisma.rt.count();
    const totalResidents = rawResidents.length;

    // Distributions
    const genderDist = { L: 0, P: 0 };
    const religionDist = {};
    const ageDist = {
      'Balita (0-5)': 0,
      'Anak-anak (6-12)': 0,
      'Remaja (13-17)': 0,
      'Dewasa (18-59)': 0,
      'Lansia (60+)': 0,
    };

    const currentYear = new Date().getFullYear();

    rawResidents.forEach(res => {
      // Gender
      if (res.jenis_kelamin === 'L') genderDist.L++;
      else if (res.jenis_kelamin === 'P') genderDist.P++;

      // Religion
      const agama = res.agama || 'Tidak Diketahui';
      religionDist[agama] = (religionDist[agama] || 0) + 1;

      // Age
      if (res.tanggal_lahir) {
        const birthDate = new Date(res.tanggal_lahir);
        const age = currentYear - birthDate.getFullYear();
        if (age <= 5) ageDist['Balita (0-5)']++;
        else if (age <= 12) ageDist['Anak-anak (6-12)']++;
        else if (age <= 17) ageDist['Remaja (13-17)']++;
        else if (age <= 59) ageDist['Dewasa (18-59)']++;
        else ageDist['Lansia (60+)']++;
      }
    });

    const rwStats = await getResidentStatsByRw();

    return {
      overview: {
        totalResidents,
        totalFamilies,
        totalRw,
        totalRt
      },
      demographics: {
        gender: [
          { type: 'Laki-laki', value: genderDist.L },
          { type: 'Perempuan', value: genderDist.P }
        ],
        religion: Object.entries(religionDist).map(([name, value]) => ({ type: name, value })),
        age: Object.entries(ageDist).map(([name, value]) => ({ type: name, value }))
      },
      rwDistribution: rwStats
    };
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    throw error;
  }
}
