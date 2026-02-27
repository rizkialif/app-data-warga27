const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'

// ===== APP TOKEN =====
exports.signAppToken = () => {
  return jwt.sign(
    {
      type: 'APP',
      system: 'DATAWARGA'
    },
    JWT_SECRET,
    { expiresIn: '1d' } // 1 hari
  )
}

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      type: 'ACCESS',
      userId: user.id,
      role: user.role,
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn: '10s' } // cepat expired (TESTING)
  )
}

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}
