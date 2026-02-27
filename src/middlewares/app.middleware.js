const { verifyToken } = require('../utils/jwt')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Application token required' })
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token format. Use Bearer <token>' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
     return res.status(401).json({ message: 'Token missing' })
  }

  try {
    const decoded = verifyToken(token)

    if (decoded.type !== 'APP') {
      return res.status(403).json({ message: 'Invalid application token' })
    }

    req.appSession = decoded
    next()
  } catch (err) {
    console.error('DEBUG: Token verification failed:', err.message)
    console.error('DEBUG: Received token:', token)
    return res.status(401).json({
      message: 'Application token invalid or expired'
    })
  }
}
