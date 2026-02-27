const express = require('express')
const router = express.Router()
const rolesController = require('./roles.controller')
const accessMiddleware = require('../../../../middlewares/access.middleware')

router.use(accessMiddleware)

// CRUD Roles
router.post('/', rolesController.createRole)
router.get('/', rolesController.getAllRoles)
router.get('/detail', rolesController.getRoleById)
router.put('/update', rolesController.updateRole)
router.delete('/delete', rolesController.deleteRole)

// Manage Permissions
router.get('/:code/permissions', rolesController.getPermissions)
router.put('/:code/permissions', rolesController.updatePermissions)
router.post('/:code/permissions', rolesController.addPermissions)
router.delete('/:code/permissions/:permissionCode', rolesController.removePermission)

module.exports = router
