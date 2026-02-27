'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const reason = sessionStorage.getItem('logoutReason');
    if (reason === 'session_expired') {
      setError('Sesi Anda telah berakhir. Silakan masuk kembali.');
      sessionStorage.removeItem('logoutReason');
    } else if (reason === 'invalid_session') {
      setError('Sesi tidak valid atau telah berakhir. Silakan masuk kembali.');
      sessionStorage.removeItem('logoutReason');
    }
  }, []);

  const handleLogin = async (values) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Login failed')
      }

      // Store tokens
      localStorage.setItem('accessToken', result.data.accessToken)
      localStorage.setItem('refreshToken', result.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(result.data.user))

      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Data Warga" 
      subtitle="Silakan masuk ke akun Anda" 
      icon={<LogIn size={32} />}
    >
      <LoginForm 
        onFinish={handleLogin} 
        loading={loading} 
        error={error} 
      />
      <div style={{ marginTop: 24, textAlign: 'center', color: '#8c8c8c', fontSize: '12px' }}>
        &copy; 2026 Resident Management System
      </div>
    </AuthLayout>
  )
}
