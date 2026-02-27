import prisma from '@/lib/prisma'
import { signAppToken, signAccessToken } from '../lib/jwt'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export const generateAppToken = async () => {
  return signAppToken()
}

export const login = async (username, password) => {
  const user = await prisma.users.findUnique({
    where: { username }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  // Fetch permissions based on role
  const rolePermissions = await prisma.role_permissions.findMany({
    where: { role_code: user.role_code },
    select: { permission_code: true }
  })
  const permissions = rolePermissions.map(rp => rp.permission_code)

  console.log('[DEBUG] Login - User found in DB:', { id: user.id, username: user.username, role_code: user.role_code, permissions });
  
  // Attach permissions to user object for token signing
  user.permissions = permissions
  const accessToken = signAccessToken(user)
  const refreshTokenString = crypto.randomBytes(40).toString('hex')
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshtoken.create({
    data: {
      token: refreshTokenString,
      user_id: user.id,
      expires_at: expiresAt
    }
  })

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
      role_code: user.role_code,
      permissions
    }
  }
}

export const refreshToken = async (token) => {
  if (!token) {
    throw new Error('Refresh token is required')
  }
  
  try {
    const storedToken = await prisma.refreshtoken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!storedToken) {
      throw new Error('Invalid refresh token')
    }

    if (storedToken.expires_at < new Date()) {
      throw new Error('Refresh token expired')
    }

    // Fetch permissions for the refreshed token
    const rolePermissions = await prisma.role_permissions.findMany({
      where: { role_code: storedToken.user.role_code },
      select: { permission_code: true }
    })
    const permissions = rolePermissions.map(rp => rp.permission_code)
    
    // Attach permissions to user object
    storedToken.user.permissions = permissions

    const newAccessToken = signAccessToken(storedToken.user)

    return {
      accessToken: newAccessToken
    }
  } catch (error) {
    console.error('[ERROR] refreshToken service:', error);
    // Sanitize Prisma errors or other DB errors
    if (error.code && error.code.startsWith('P')) {
      throw new Error('Sesi tidak valid, silakan login kembali')
    }
    throw error // Re-throw if it's already a clean error message
  }
}
