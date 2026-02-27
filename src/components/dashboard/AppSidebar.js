'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// Simple helper to check if the user has a permission string
const hasMenuPermission = (permissions, permissionCode) => {
  // If no permissions array, we assume no access
  if (!permissions) return false;
  // If the user has a wildcard or root admin permission, you could return true here
  // For now, check exactly
  return permissions.includes(permissionCode);
};

const { Sider } = Layout;

const AppSidebar = ({ collapsed, onCollapse }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push('/login');
  };

  // State to hold the user's permissions
  const [userPermissions, setUserPermissions] = React.useState([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Read the user object from localStorage when the component mounts
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserPermissions(userObj.permissions || []);
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
      }
    }
    setMounted(true);
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    (hasMenuPermission(userPermissions, 'menu:master-data') || 
     hasMenuPermission(userPermissions, 'menu:rt') ||
     hasMenuPermission(userPermissions, 'menu:rw') ||
     hasMenuPermission(userPermissions, 'menu:roles') ||
     hasMenuPermission(userPermissions, 'menu:permissions')) && {
      key: 'master-data',
      icon: <DatabaseOutlined />,
      label: 'Master Data',
      children: [
        hasMenuPermission(userPermissions, 'menu:rt') && {
          key: '/dashboard/rt',
          label: <Link href="/dashboard/rt">Data RT</Link>,
        },
        hasMenuPermission(userPermissions, 'menu:rw') && {
          key: '/dashboard/rw',
          label: <Link href="/dashboard/rw">Data RW</Link>,
        },
        hasMenuPermission(userPermissions, 'menu:roles') && {
          key: '/dashboard/roles',
          label: <Link href="/dashboard/roles">Data Roles</Link>,
        },
        hasMenuPermission(userPermissions, 'menu:permissions') && {
          key: '/dashboard/permissions',
          label: <Link href="/dashboard/permissions">Data Permission</Link>,
        },
      ].filter(Boolean),
    },
    (hasMenuPermission(userPermissions, 'menu:resident-data') ||
     hasMenuPermission(userPermissions, 'menu:family') ||
     hasMenuPermission(userPermissions, 'menu:warga')) && {
      key: 'resident-data',
      icon: <UserOutlined />,
      label: 'Resident Data',
      children: [
        hasMenuPermission(userPermissions, 'menu:family') && {
          key: '/dashboard/family',
          label: <Link href="/dashboard/family">Data Kepala Keluarga</Link>,
        },
        hasMenuPermission(userPermissions, 'menu:warga') && {
          key: '/dashboard/warga',
          label: <Link href="/dashboard/warga">Data Warga</Link>,
        },
      ].filter(Boolean),
    },
    hasMenuPermission(userPermissions, 'menu:zakat') && {
      key: 'zakat',
      icon: <WalletOutlined />,
      label: 'Penerimaan Zakat',
      children: [
        {
          key: '/dashboard/zakat/recipient',
          label: <Link href="/dashboard/zakat/recipient">List Penerima Zakat</Link>,
        },
        {
          key: '/dashboard/zakat/collection',
          label: <Link href="/dashboard/zakat/collection">Data Penerimaan Zakat</Link>,
        },
      ],
    },
    hasMenuPermission(userPermissions, 'menu:users') && {
      key: '/dashboard/users',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/users">Users</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      danger: true,
      onClick: handleLogout,
      style: { marginTop: 'auto' },
    },
  ].filter(Boolean); // Filter out any false/undefined values from permissions checks

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      width={200}
      style={{
        borderRight: '1px solid #f0f0f0',
        zIndex: 101,
        transition: 'all 0.2s ease',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0
      }}
    >
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 16px',
        borderBottom: '1px solid #f0f0f0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#1677ff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px',
          marginRight: collapsed ? 0 : '8px'
        }}>
          W
        </div>
        {!collapsed && <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1677ff' }}>DataWarga</span>}
      </div>
      {mounted && (
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ height: 'calc(100% - 64px)', borderRight: 0, display: 'flex', flexDirection: 'column' }}
        />
      )}
    </Sider>
  );
};

export default AppSidebar;
