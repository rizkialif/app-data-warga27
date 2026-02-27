const authService = require('./auth.service')

exports.generateAppToken = async (req, res) => {
  try {
    const token = await authService.generateAppToken()

    res.json({
      message: 'Application token generated',
      app_token: token
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to generate application token',
      error: error.message
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    const result = await authService.login(username, password)

    res.json({
      message: 'Login success',
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      user: result.user
    })
  } catch (error) {
    res.status(401).json({
      message: 'Login failed',
      error: error.message
    })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({
        message: 'Refresh token is required'
      })
    }

    const result = await authService.refreshToken(refresh_token)

    res.json({
      message: 'Token refreshed',
      access_token: result.accessToken
    })
  } catch (error) {
    res.status(401).json({
      message: 'Refresh expired / failed',
      error: error.message
    })
  }
}
