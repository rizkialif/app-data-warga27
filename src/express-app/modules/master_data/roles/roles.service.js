const prisma = require('../../../../config/prisma')

exports.getAllRoles = async () => {
  return await prisma.roles.findMany({
    include: {
      role_permissions: {
        include: {
          permissions: true
        }
      }
    }
  })
}

exports.getRoleByCode = async (code) => {
  console.log('Service: getRoleByCode called with Code:', code)
  try {
    const role = await prisma.roles.findUnique({
      where: { code: code },
      include: {
        role_permissions: {
          include: {
            permissions: true
          }
        }
      }
    })
    
    if (!role) {
      throw new Error('Role not found')
    }

    return role
  } catch (err) {
    console.error('Service Prisma Error:', err)
    throw err
  }
}

exports.createRole = async (data) => {
  return await prisma.roles.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description
    }
  })
}

exports.updateRole = async (code, data) => {
  const role = await prisma.roles.findUnique({
    where: { code: code }
  })

  if (!role) {
    throw new Error('Role not found')
  }

  return await prisma.roles.update({
    where: { code: code },
    data: {
      name: data.name,
      description: data.description
    }
  })
}

exports.deleteRole = async (code) => {
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

exports.assignPermissionToRole = async (roleCode, permissionCodes) => {
  const role = await prisma.roles.findUnique({
    where: { code: roleCode }
  })

  if (!role) {
    throw new Error('Role not found')
  }

  // construct data for createMany
  const data = permissionCodes.map(permissionCode => ({
    role_code: roleCode,
    permission_code: permissionCode
  }))

  return await prisma.role_permissions.createMany({
    data,
    skipDuplicates: true
  })
}

exports.removePermissionFromRole = async (roleCode, permissionCode) => {
  return await prisma.role_permissions.deleteMany({
    where: {
      role_code: roleCode,
      permission_code: permissionCode
    }
  })
}

exports.getPermissionsByRoleCode = async (roleCode) => {
  const role = await prisma.roles.findUnique({
    where: { code: roleCode },
    include: {
      role_permissions: {
        include: {
          permissions: true
        }
      }
    }
  })

  if (!role) {
    throw new Error('Role not found')
  }

  return role.role_permissions.map(rp => rp.permissions)
}

exports.updateRolePermissions = async (roleCode, permissionCodes) => {
  return await prisma.$transaction(async (prisma) => {
    // 1. Delete all existing permissions for this role
    await prisma.role_permissions.deleteMany({
      where: { role_code: roleCode }
    })

    // 2. Create new permissions
    const data = permissionCodes.map(permissionCode => ({
      role_code: roleCode,
      permission_code: permissionCode
    }))

    if (data.length > 0) {
      await prisma.role_permissions.createMany({
        data,
        skipDuplicates: true
      })
    }

    return true
  })
}
