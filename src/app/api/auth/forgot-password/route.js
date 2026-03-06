import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username atau Email diperlukan' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan username atau email
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Generate token acak
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token berlaku 1 jam
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Simpan token ke database
    await prisma.password_reset_token.create({
      data: {
        email: user.email,
        token: hash,
        expires_at: expiresAt
      }
    });

    // URl untuk reset password
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // RESPONSE SIMULASI: Karena tidak ada SMTP, link dikirimkan via response
    return NextResponse.json(
      { 
        message: 'Link reset password berhasil dibuat.', 
        data: {
          resetLink: resetUrl,
          email: user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
