import jwt from 'jsonwebtoken'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'
const JWT_SECRET_UINT8 = new TextEncoder().encode(JWT_SECRET)

export const signAppToken = () => {
  return jwt.sign(
    {
      type: 'APP',
      system: 'DATAWARGA'
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  )
}

export const signAccessToken = (user) => {
  console.log('[DEBUG] Signing Access Token for User ID:', user.id, 'Role:', user.role_code, 'Permissions:', user.permissions);
  return jwt.sign(
    {
      type: 'ACCESS',
      userId: user.id,
      role: user.role_code,
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

/**
 * Edge-compatible JWT verification using jose
 * @param {string} token 
 * @returns {Promise<object>}
 */
export const verifyTokenEdge = async (token) => {
  const { payload } = await jwtVerify(token, JWT_SECRET_UINT8)
  return payload
}
