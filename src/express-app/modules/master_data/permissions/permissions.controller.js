const permissionsService = require('./permissions.service')

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await permissionsService.getAllPermissions()
    res.json({
      message: 'Permissions retrieved successfully',
      data: permissions
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve permissions',
      error: error.message
    })
  }
}

exports.createPermission = async (req, res) => {
  try {
    const { code, name } = req.body
    if (!code) return res.status(400).json({ message: 'Permission Code is required' })
    if (!name) return res.status(400).json({ message: 'Permission Name is required' })

    const permission = await permissionsService.createPermission(req.body)
    res.status(201).json({
      message: 'Permission created successfully',
      data: permission
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create permission',
      error: error.message
    })
  }
}

exports.getPermissionByCode = async (req, res) => {
  try {
    const code = req.query.code || req.query.id
    if (!code) return res.status(400).json({ message: 'Permission Code is required' })

    const permission = await permissionsService.getPermissionByCode(code)
    res.json({
      message: 'Permission retrieved successfully',
      data: permission
    })
  } catch (error) {
    res.status(404).json({
      message: 'Permission not found',
      error: error.message
    })
  }
}

exports.updatePermission = async (req, res) => {
  try {
    const { update } = req.query
    const code = update || req.query.code || req.query.id
    if (!code) return res.status(400).json({ message: 'Permission Code is required' })

    const permission = await permissionsService.updatePermission(code, req.body)
    res.json({
      message: 'Permission updated successfully',
      data: permission
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update permission',
      error: error.message
    })
  }
}

exports.deletePermission = async (req, res) => {
  try {
    const { delete: deleteCode } = req.query
    const code = deleteCode || req.query.code || req.query.id
    if (!code) return res.status(400).json({ message: 'Permission Code is required' })

    await permissionsService.deletePermission(code)
    res.json({
      message: 'Permission deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete permission',
      error: error.message
    })
  }
}
