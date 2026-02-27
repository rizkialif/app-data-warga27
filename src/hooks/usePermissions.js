'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to get the current user's permissions and check access
 * @returns {object} { permissions, hasPermission, hasAnyPermission }
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setPermissions(userObj.permissions || []);
      } catch (err) {
        console.error('Failed to parse user permissions:', err);
      }
    }
    setIsLoaded(true);
  }, []);

  const hasPermission = (permissionCode) => {
    if (!isLoaded) return false;
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes) => {
    if (!isLoaded) return false;
    return permissionCodes.some(code => permissions.includes(code));
  };

  return { permissions, hasPermission, hasAnyPermission, isLoaded };
}

/**
 * Higher Order Component to restrict access to pages/components
 */
export function withPermission(WrappedComponent, requiredPermission) {
  return function PermissionWrapper(props) {
    const { hasPermission, isLoaded } = usePermissions();

    if (!isLoaded) {
      return null; // Or a loading spinner
    }

    if (!hasPermission(requiredPermission)) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h2>403 - Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
