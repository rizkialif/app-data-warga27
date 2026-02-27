const express = require('express')
const router = express.Router()
const permissionsController = require('./permissions.controller')
const accessMiddleware = require('../../../../middlewares/access.middleware')

router.use(accessMiddleware)

router.get('/', permissionsController.getAllPermissions)
router.post('/', permissionsController.createPermission)
router.get('/detail', permissionsController.getPermissionByCode)
router.put('/update', permissionsController.updatePermission)
router.delete('/delete', permissionsController.deletePermission)

module.exports = router
