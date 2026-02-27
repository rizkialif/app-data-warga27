'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

const AppNavbar = ({ collapsed, onToggle }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profil Saya',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Keluar',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header style={{ 
      padding: '0 16px', 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 99,
      width: '100%',
      height: '64px',
      lineHeight: '64px',
      borderBottom: '1px solid #f0f0f0',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: '18px',
            width: 40,
            height: 40,
            marginRight: 16
          }}
        />
      </div>
      
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Space size={12}>
            <div style={{ textAlign: 'right', display: mounted ? 'flex' : 'none', flexDirection: 'column' }}>
              <Text strong style={{ display: 'block', lineHeight: '1.2' }}>{mounted ? (user?.nama || 'Admin') : ' '}</Text>
              <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>{mounted ? (user?.role_code || 'Operator') : ' '}</Text>
            </div>
            <Avatar 
              size="large" 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1677ff' }}
              src={mounted ? user?.avatar : undefined}
            />
          </Space>
        </div>
      </Dropdown>
    </Header>
  );
};

export default AppNavbar;
