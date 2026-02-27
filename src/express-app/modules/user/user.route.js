const express = require('express')
const router = express.Router()
const userController = require('./user.controller')
const accessMiddleware = require('../../../middlewares/access.middleware')

// Apply middleware to all routes
router.use(accessMiddleware)

router.get('/', userController.getAllUsers)
router.post('/', userController.createUser)
router.get('/detail', userController.getUserById)
router.put('/update', userController.updateUser)
router.delete('/delete', userController.deleteUser)

module.exports = router
