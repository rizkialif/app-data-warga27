import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token dan password baru diperlukan' },
        { status: 400 }
      );
    }

    // Hash token dari request untuk dicocokkan dengan DB
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    // Cari token di database
    const resetTokenRecord = await prisma.password_reset_token.findUnique({
      where: {
        token: hash
      }
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { message: 'Token tidak valid' },
        { status: 400 }
      );
    }

    // Cek apakah token expired
    if (resetTokenRecord.expires_at < new Date()) {
      // Hapus token expired
      await prisma.password_reset_token.delete({
        where: { id: resetTokenRecord.id }
      });
      return NextResponse.json(
        { message: 'Token telah kadaluarsa' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email dari token
    const user = await prisma.users.findUnique({
      where: { email: resetTokenRecord.email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password di database
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Hapus token yang sudah digunakan
    await prisma.password_reset_token.delete({
      where: { id: resetTokenRecord.id }
    });

    return NextResponse.json(
      { message: 'Password berhasil diubah. Silakan login kembali.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
