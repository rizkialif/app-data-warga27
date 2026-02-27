import prisma from '../lib/prisma'

export const getAllPermissions = async () => {
  return await prisma.permissions.findMany()
}

export const getPermissionByCode = async (code) => {
  const permission = await prisma.permissions.findUnique({
    where: { code: code }
  })
  
  if (!permission) {
    throw new Error('Permission not found')
  }

  return permission
}

export const createPermission = async (data) => {
  return await prisma.permissions.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description
    }
  })
}

export const updatePermission = async (code, data) => {
  const permission = await prisma.permissions.findUnique({
    where: { code: code }
  })

  if (!permission) {
    throw new Error('Permission not found')
  }

  return await prisma.permissions.update({
    where: { code: code },
    data: {
      name: data.name || undefined,
      description: data.description || undefined
    }
  })
}

export const deletePermission = async (code) => {
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
