import prisma from '../lib/prisma'

export const getAllRoles = async () => {
  return await prisma.roles.findMany()
}

export const getRoleByCode = async (code) => {
  const role = await prisma.roles.findUnique({
    where: { code: code }
  })
  
  if (!role) {
    throw new Error('Role not found')
  }

  return role
}

export const createRole = async (data) => {
  return await prisma.roles.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description
    }
  })
}

export const updateRole = async (code, data) => {
  const role = await prisma.roles.findUnique({
    where: { code: code }
  })

  if (!role) {
    throw new Error('Role not found')
  }

  return await prisma.roles.update({
    where: { code: code },
    data: {
      name: data.name || undefined,
      description: data.description || undefined
    }
  })
}

export const deleteRole = async (code) => {
  const role = await prisma.roles.findUnique({
    where: { code: code }
  })

  if (!role) {
    throw new Error('Role not found')
  }

  return await prisma.roles.delete({
    where: { code: code }
  })
}
