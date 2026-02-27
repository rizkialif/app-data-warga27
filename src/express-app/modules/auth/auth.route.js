const express = require('express')
const router = express.Router()
const authController = require('./auth.controller')
const appMiddleware = require('../../../middlewares/app.middleware')

router.get('/app-token', authController.generateAppToken)
router.post('/login', appMiddleware, authController.login)
router.post('/refresh-token', appMiddleware, authController.refreshToken)

module.exports = router
