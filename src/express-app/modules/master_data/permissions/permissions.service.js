const prisma = require('../../../../config/prisma')

exports.getAllPermissions = async () => {
  return await prisma.permissions.findMany()
}

exports.createPermission = async (data) => {
  return await prisma.permissions.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description
    }
  })
}

exports.getPermissionByCode = async (code) => {
  const permission = await prisma.permissions.findUnique({
    where: { code: code }
  })

  if (!permission) {
    throw new Error('Permission not found')
  }

  return permission
}

exports.updatePermission = async (code, data) => {
  const permission = await prisma.permissions.findUnique({
    where: { code: code }
  })

  if (!permission) {
    throw new Error('Permission not found')
  }

  return await prisma.permissions.update({
    where: { code: code },
    data: {
      name: data.name,
      description: data.description
    }
  })
}

exports.deletePermission = async (code) => {
  const permission = await prisma.permissions.findUnique({
    where: { code: code }
  })

  if (!permission) {
    throw new Error('Permission not found')
  }

  return await prisma.permissions.delete({
    where: { code: code }
  })
}
