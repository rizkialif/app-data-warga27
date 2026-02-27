const express = require('express')
const router = express.Router()
const rwController = require('./rw.controller')
const accessMiddleware = require('../../../../middlewares/access.middleware')

// Apply middleware to all routes
router.use(accessMiddleware)

router.post('/', rwController.createRw)
router.get('/', rwController.getAllRw)
router.get('/:id', rwController.getRwById)
router.put('/:id', rwController.updateRw)
router.delete('/:id', rwController.deleteRw)

module.exports = router
