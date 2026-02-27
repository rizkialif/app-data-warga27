'use client';

import React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

/**
 * LoginForm is a reusable login form component.
 */
const LoginForm = ({ onFinish, loading, error }) => {
  return (
    <Form
      name="login_form"
      layout="vertical"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      size="large"
    >
      {error && (
        <Form.Item>
          <Alert title={error} type="error" showIcon closable />
        </Form.Item>
      )}

      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Silakan masukkan username Anda!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Silakan masukkan password Anda!' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading} 
          block 
          style={{ height: '48px', marginTop: '8px' }}
        >
          Masuk Sekarang
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
