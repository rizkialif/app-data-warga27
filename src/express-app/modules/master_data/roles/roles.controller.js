const rolesService = require('./roles.service')

exports.createRole = async (req, res) => {
  try {
    const { code, name } = req.body
    if (!code) {
      return res.status(400).json({ message: 'Role code is required' })
    }
    if (!name) {
      return res.status(400).json({ message: 'Role name is required' })
    }
    const role = await rolesService.createRole(req.body)
    res.status(201).json({
      message: 'Role created successfully',
      data: role
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create role',
      error: error.message
    })
  }
}

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await rolesService.getAllRoles()
    res.json({
      message: 'Roles retrieved successfully',
      data: roles
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve roles',
      error: error.message
    })
  }
}

exports.getRoleById = async (req, res) => {
  try {
    // using query ?id= is still possible if mapped to code, but better to use ?code= or fallback
    // The user requested ?detail?id= before, now let's support ?code= or ?id= mapped to code
    const code = req.query.code || req.query.id
    
    if (!code) return res.status(400).json({ message: 'Role Data (code) is required' })

    const role = await rolesService.getRoleByCode(code)
    res.json({
      message: 'Role details retrieved successfully',
      data: role
    })
  } catch (error) {
    res.status(404).json({
      message: 'Role not found',
      error: error.message
    })
  }
}

exports.updateRole = async (req, res) => {
  try {
    const { update } = req.query
    const code = update || req.query.code || req.query.id
    
    if (!code) return res.status(400).json({ message: 'Role Code is required' })

    const role = await rolesService.updateRole(code, req.body)
    res.json({
      message: 'Role updated successfully',
      data: role
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update role',
      error: error.message
    })
  }
}

exports.deleteRole = async (req, res) => {
  try {
    const { delete: deleteCode } = req.query
    const code = deleteCode || req.query.code || req.query.id

    if (!code) return res.status(400).json({ message: 'Role Code is required' })
      
    await rolesService.deleteRole(code)
    res.json({
      message: 'Role deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete role',
      error: error.message
    })
  }
}

exports.addPermissions = async (req, res) => {
  try {
    const { permissionCodes } = req.body
    if (!permissionCodes || !Array.isArray(permissionCodes)) {
        return res.status(400).json({ message: 'permissionCodes array is required' })
    }

    // req.params.code matches the route /:code/permissions
    await rolesService.assignPermissionToRole(req.params.code, permissionCodes)
    res.json({
      message: 'Permissions assigned successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to assign permissions',
      error: error.message
    })
  }
}

exports.removePermission = async (req, res) => {
  try {
    await rolesService.removePermissionFromRole(req.params.code, req.params.permissionCode)
    res.json({
      message: 'Permission removed successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove permission',
      error: error.message
    })
  }
}

exports.getPermissions = async (req, res) => {
  try {
    const permissions = await rolesService.getPermissionsByRoleCode(req.params.code)
    res.json({
      message: 'Role permissions retrieved successfully',
      data: permissions
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve role permissions',
      error: error.message
    })
  }
}

exports.updatePermissions = async (req, res) => {
  try {
    const { permissionCodes } = req.body
    if (!permissionCodes || !Array.isArray(permissionCodes)) {
        return res.status(400).json({ message: 'permissionCodes array is required' })
    }

    await rolesService.updateRolePermissions(req.params.code, permissionCodes)
    res.json({
      message: 'Role permissions updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update role permissions',
      error: error.message
    })
  }
}
