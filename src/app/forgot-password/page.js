'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyOutlined, UserOutlined } from '@ant-design/icons'
import { Form, Input, Button, Alert, Typography } from 'antd'
import AuthLayout from '@/components/auth/AuthLayout'
import Link from 'next/link'

const { Text } = Typography

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleForgot = async (values) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setResetLink('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Gagal memproses permintaan')
      }

      setSuccess(result.message)
      if (result.data?.resetLink) {
        setResetLink(result.data.resetLink)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Lupa Password" 
      subtitle="Masukkan username / email untuk mereset sandi Anda" 
      icon={<KeyOutlined size={32} />}
    >
      <Form
        name="forgot_password_form"
        layout="vertical"
        onFinish={handleForgot}
        size="large"
      >
        {error && (
          <Form.Item>
            <Alert message={error} type="error" showIcon closable />
          </Form.Item>
        )}

        {success && (
          <Form.Item>
            <Alert 
              message={success} 
              description={
                resetLink && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Simulasi Email: Silakan salin link berikut atau klik langsung untuk mereset password (link ini aslinya dikirim via email log): </Text>
                    <br />
                    <a href={resetLink} style={{ wordBreak: 'break-all', fontWeight: 'bold' }}>{resetLink}</a>
                  </div>
                )
              }
              type="success" 
              showIcon 
            />
          </Form.Item>
        )}

        <Form.Item
          label="Username / Email"
          name="username"
          rules={[{ required: true, message: 'Silakan masukkan username atau email Anda!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Masukkan username atau email" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block 
            style={{ height: '48px', marginTop: '8px' }}
          >
            Kirim Link Reset
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">Ingat password Anda? </Text>
          <Link href="/login" style={{ color: '#1677ff' }}>Kembali ke Login</Link>
        </div>
      </Form>
    </AuthLayout>
  )
}
