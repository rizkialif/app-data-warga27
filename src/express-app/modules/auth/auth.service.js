const prisma = require('../../../config/prisma')
const { signAppToken, signAccessToken } = require('../../../utils/jwt')
const bcrypt = require('bcrypt')

exports.generateAppToken = async () => {
  return signAppToken()
}

exports.login = async (username, password) => {
  const user = await prisma.users.findUnique({
    where: { username }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  const accessToken = signAccessToken(user)
  
  // Generate Refresh Token (bisa pakai uuid atau string random, di sini simple pakai random string + timestamp)
  const refreshTokenString = require('crypto').randomBytes(40).toString('hex')
  
  // Simpan Refresh Token ke DB
  // Set expire misal 7 hari dari sekarang
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenString,
      user_id: user.id,
      expires_at: expiresAt
    }
  })

  // Update last_login
  await prisma.users.update({
    where: { id: user.id },
    data: { last_login: new Date() }
  })

  return {
    accessToken,
    refreshToken: refreshTokenString,
    user: {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role_id: user.role_id
    }
  }
}

exports.refreshToken = async (token) => {
  if (!token) {
    throw new Error('Refresh token is required')
  }
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!storedToken) {
    throw new Error('Invalid refresh token')
  }

  if (storedToken.expires_at < new Date()) {
    throw new Error('Refresh token expired')
  }

  // Generate new Access Token
  const newAccessToken = signAccessToken(storedToken.user)

  return {
    accessToken: newAccessToken
  }
}