const express = require('express')
const router = express.Router()
const rtController = require('./rt.controller')
const accessMiddleware = require('../../../../middlewares/access.middleware')

// Apply middleware to all routes
router.use(accessMiddleware)

router.post('/', rtController.createRt)
router.get('/', rtController.getAllRt)
router.get('/detail', rtController.getRtById)
router.put('/update', rtController.updateRt)
router.delete('/delete', rtController.deleteRt)

module.exports = router
