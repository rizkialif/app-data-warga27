'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import AppSidebar from '@/components/dashboard/AppSidebar';
import AppNavbar from '@/components/dashboard/AppNavbar';

const { Content } = Layout;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout style={{ 
        transition: 'all 0.2s ease',
        backgroundColor: '#f5f7f9',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppNavbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Content style={{ 
          margin: 0, 
          padding: '24px 16px', 
          background: '#fff', 
          flex: 1,
          overflow: 'initial'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

