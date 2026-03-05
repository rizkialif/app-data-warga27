import prisma from '../lib/prisma'

export const getAllResidents = async () => {
  return await prisma.resident.findMany({
    include: {
      family: {
        include: {
          resident: true,
          rt: {
            include: {
              rw: true
            }
          }
        }
      }
    },
    orderBy: {
      family: {
        no_kk: 'asc'
      }
    }
  })
}

export const getResidentById = async (id) => {
  const resident = await prisma.resident.findUnique({
    where: { id: Number(id) },
    include: {
      family: {
        include: {
          resident: true,
          rt: {
            include: {
              rw: true
            }
          }
        }
      }
    }
  })

  if (!resident) {
    throw new Error('Resident not found')
  }

  return resident
}

export const createResident = async (data) => {
  const existingByNik = await prisma.resident.findUnique({
    where: { nik: data.nik }
  })

  if (existingByNik) {
    throw new Error(`Warga dengan NIK ${data.nik} sudah terdaftar dengan nama ${existingByNik.nama}`)
  }

  return await prisma.resident.create({
    data: {
      nik: data.nik,
      nama: data.nama,
      jenis_kelamin: data.jenis_kelamin,
      tempat_lahir: data.tempat_lahir || null,
      tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
      agama: data.agama || null,
      pekerjaan: data.pekerjaan || null,
      status_perkawinan: data.status_perkawinan || 'belum_kawin',
      status_dalam_keluarga: data.status_dalam_keluarga,
      status_warga: data.status_warga || 'aktif',
      family_id: Number(data.family_id)
    }
  })
}

export const updateResident = async (id, data) => {
  const resident = await prisma.resident.findUnique({
    where: { id: Number(id) }
  })

  if (!resident) {
    throw new Error('Resident not found')
  }

  // If NIK is being updated, check if it's already used by another resident
  if (data.nik && data.nik !== resident.nik) {
    const existingByNik = await prisma.resident.findUnique({
      where: { nik: data.nik }
    })

    if (existingByNik) {
      throw new Error(`NIK ${data.nik} sudah digunakan oleh warga lain (${existingByNik.nama})`)
    }
  }

  return await prisma.resident.update({
    where: { id: Number(id) },
    data: {
      nik: data.nik || undefined,
      nama: data.nama || undefined,
      jenis_kelamin: data.jenis_kelamin || undefined,
      tempat_lahir: data.tempat_lahir !== undefined ? data.tempat_lahir : undefined,
      tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : undefined,
      agama: data.agama !== undefined ? data.agama : undefined,
      pekerjaan: data.pekerjaan !== undefined ? data.pekerjaan : undefined,
      status_perkawinan: data.status_perkawinan || undefined,
      status_dalam_keluarga: data.status_dalam_keluarga || undefined,
      status_warga: data.status_warga || undefined,
      family_id: data.family_id ? Number(data.family_id) : undefined
    }
  })
}

export const deleteResident = async (id) => {
  const resident = await prisma.resident.findUnique({
    where: { id: Number(id) }
  })

  if (!resident) {
    throw new Error('Resident not found')
  }

  return await prisma.resident.delete({
    where: { id: Number(id) }
  })
}
