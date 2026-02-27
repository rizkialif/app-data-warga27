const prisma = require('../../../config/prisma')
const bcrypt = require('bcrypt')

exports.getAllUsers = async () => {
  return await prisma.users.findMany({
    select: {
      id: true,
      nama: true,
      username: true,
      email: true,
      role_code: true,
      rw_id: true,
      rt_id: true,
      status: true,
      last_login: true,
      created_at: true,
      updated_at: true,
      roles: {
        select: {
          name: true
        }
      },
      rw: {
        select: {
          nomor: true,
          nama: true
        }
      },
      rt: {
        select: {
          nomor: true
        }
      }
    }
  })
}

exports.getUserById = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      nama: true,
      username: true,
      email: true,
      role_code: true,
      rw_id: true,
      rt_id: true,
      status: true,
      last_login: true,
      created_at: true,
      updated_at: true,
      roles: {
        select: {
          name: true
        }
      },
      rw: {
        select: {
          nomor: true,
          nama: true
        }
      },
      rt: {
        select: {
          nomor: true
        }
      }
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10)

  return await prisma.users.create({
    data: {
      nama: data.nama,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role_code: data.role_code,
      rw_id: data.rw_id ? Number(data.rw_id) : null,
      rt_id: data.rt_id ? Number(data.rt_id) : null,
      status: data.status || 'aktif'
    },
    select: {
      id: true,
      nama: true,
      username: true,
      email: true,
      role_code: true,
      status: true,
      created_at: true
    }
  })
}

exports.updateUser = async (id, data) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const updateData = {
    nama: data.nama,
    username: data.username,
    email: data.email,
    role_code: data.role_code,
    rw_id: data.rw_id !== undefined ? (data.rw_id ? Number(data.rw_id) : null) : undefined,
    rt_id: data.rt_id !== undefined ? (data.rt_id ? Number(data.rt_id) : null) : undefined,
    status: data.status,
    updated_at: new Date()
  }

  // Remove undefined fields
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  return await prisma.users.update({
    where: { id: Number(id) },
    data: updateData,
    select: {
      id: true,
      nama: true,
      username: true,
      email: true,
      role_code: true,
      rt_id: true,
      rw_id: true,
      status: true,
      updated_at: true
    }
  })
}

exports.deleteUser = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return await prisma.users.delete({
    where: { id: Number(id) }
  })
}
