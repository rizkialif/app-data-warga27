/**
 * Utility functions for analyzing permissions from the incoming Next.js request headers.
 */

/**
 * Retrieves the permissions array from the authenticated request headers.
 * 
 * @param {Request} request - The incoming Next.js request object
 * @returns {string[]} An array of permission codes
 */
export const getUserPermissions = (request) => {
  try {
    const permissionsHeader = request.headers.get('x-user-permissions')
    if (!permissionsHeader) return []
    return JSON.parse(permissionsHeader)
  } catch (err) {
    console.error('[ERROR] Failed to parse permissions header:', err)
    return []
  }
}

/**
 * Checks if the current request has the required permission.
 * 
 * @param {Request} request - The incoming Next.js request object
 * @param {string} permissionCode - The required permission code (e.g., 'action:create:rt')
 * @returns {boolean} True if the user has the permission, false otherwise
 */
export const hasPermission = (request, permissionCode) => {
  const permissions = getUserPermissions(request)
  return permissions.includes(permissionCode)
}

/**
 * Checks if the current request has ANY of the given permissions.
 * 
 * @param {Request} request - The incoming Next.js request object
 * @param {string[]} permissionCodes - Array of required permission codes
 * @returns {boolean} True if the user has at least one of the permissions, false otherwise
 */
export const hasAnyPermission = (request, permissionCodes) => {
  const permissions = getUserPermissions(request)
  return permissionCodes.some(code => permissions.includes(code))
}

/**
 * Checks if the current request has ALL of the given permissions.
 * 
 * @param {Request} request - The incoming Next.js request object
 * @param {string[]} permissionCodes - Array of required permission codes
 * @returns {boolean} True if the user has all of the permissions, false otherwise
 */
export const hasAllPermissions = (request, permissionCodes) => {
  const permissions = getUserPermissions(request)
  return permissionCodes.every(code => permissions.includes(code))
}
