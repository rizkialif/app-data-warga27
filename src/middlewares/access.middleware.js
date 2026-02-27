const { verifyToken } = require('../utils/jwt')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Access token required' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)

    if (decoded.type !== 'ACCESS') {
      return res.status(403).json({ message: 'Invalid access token' })
    }

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      message: 'Access token invalid or expired'
    })
  }
}
