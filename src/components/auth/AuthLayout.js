import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

/**
 * AuthLayout provides a consistent wrapper for all authentication-related pages.
 */
const AuthLayout = ({ children, title, subtitle, icon }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ 
        maxWidth: 400, 
        width: '100%', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {icon && (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 64, 
              height: 64, 
              backgroundColor: '#1677ff', 
              borderRadius: '16px', 
              marginBottom: 16,
              color: '#fff',
              fontSize: 32
            }}>
              {icon}
            </div>
          )}
          <Title level={2} style={{ marginBottom: 8 }}>{title || 'Data Warga'}</Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;
