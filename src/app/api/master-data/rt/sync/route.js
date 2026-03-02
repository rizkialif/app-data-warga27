import { NextResponse } from 'next/server'
import * as rtService from '@/services/rt.shared'
import { hasPermission } from '@/utils/permission'

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:update:rt')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update RT' },
        { status: 403 }
      )
    }

    const body = await request.json()
    if (!body.rw_id || !Array.isArray(body.nomor_list)) {
      return NextResponse.json({ message: 'rw_id and nomor_list are required' }, { status: 400 });
    }

    const result = await rtService.syncRtByRw(body.rw_id, body.nomor_list)
    return NextResponse.json({
      message: 'RT synced successfully',
      data: result
    })
  } catch (error) {
    // If foreign key constraint fails, it usually throws a specific Prisma error
    // We'll wrap it in a friendly message
    const isConstraintError = error.message.includes('Foreign key constraint failed') || error.message.includes('Foreign key');
    const displayMessage = isConstraintError 
      ? 'Gagal menghapus RT yang tidak dicentang karena RT tersebut sudah memiliki data Warga/Keluarga/Ketua RT.' 
      : error.message;

    return NextResponse.json(
      { message: 'Failed to sync RT', error: displayMessage },
      { status: 500 }
    )
  }
}
