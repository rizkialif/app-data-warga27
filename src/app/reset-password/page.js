'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LockOutlined } from '@ant-design/icons'
import { Form, Input, Button, Alert, Typography } from 'antd'
import AuthLayout from '@/components/auth/AuthLayout'
import Link from 'next/link'

const { Text } = Typography

export default function ResetPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Token reset password tidak ditemukan atau tidak valid.')
    }
  }, [token])

  const handleReset = async (values) => {
    if (!token) return;

    if (values.password !== values.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token,
          newPassword: values.password 
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Gagal mereset password')
      }

      setSuccess(result.message + ' Mengalihkan ke halaman login...')
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Silakan masukkan password baru Anda" 
      icon={<LockOutlined size={32} />}
    >
      <Form
        name="reset_password_form"
        layout="vertical"
        onFinish={handleReset}
        size="large"
      >
        {error && (
          <Form.Item>
            <Alert message={error} type="error" showIcon closable />
          </Form.Item>
        )}

        {success && (
          <Form.Item>
            <Alert message={success} type="success" showIcon />
          </Form.Item>
        )}

        <Form.Item
          label="Password Baru"
          name="password"
          rules={[
            { required: true, message: 'Silakan masukkan password baru Anda!' },
            { min: 6, message: 'Password minimal 6 karakter!' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password Baru" disabled={!token || success} />
        </Form.Item>

        <Form.Item
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          rules={[{ required: true, message: 'Silakan konfirmasi password baru Anda!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Konfirmasi Password" disabled={!token || success} />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block 
            disabled={!token || success}
            style={{ height: '48px', marginTop: '8px' }}
          >
            Simpan Password Baru
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
