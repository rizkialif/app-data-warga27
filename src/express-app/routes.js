const express = require('express')
const router = express.Router()

const authRoutes = require('./modules/auth/auth.route')
const rwRoutes = require('./modules/master_data/rw/rw.route')
const rtRoutes = require('./modules/master_data/rt/rt.route')
const rolesRoutes = require('./modules/master_data/roles/roles.route')
const permissionsRoutes = require('./modules/master_data/permissions/permissions.route')
const userRoutes = require('./modules/user/user.route')
const appMiddleware = require('../middlewares/app.middleware')

router.use('/auth', authRoutes)
router.use('/master-data/rw', rwRoutes)
router.use('/master-data/rt', rtRoutes)
router.use('/master-data/roles', rolesRoutes)
router.use('/master-data/permissions', permissionsRoutes)
router.use('/users', userRoutes)

// Semua route setelah ini wajib app token
router.use(appMiddleware)

router.get('/health', (req, res) => {
  res.json({ message: 'App token valid ✅' })
})

module.exports = router
