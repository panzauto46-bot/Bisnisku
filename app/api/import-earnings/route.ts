import { NextRequest, NextResponse } from 'next/server'
import { parseEarningsFile } from '@/services/earnings-parser.service'
import { insertEarnings } from '@/services/earnings.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { success: false, error: 'File harus berformat .xlsx atau .xls' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 50 MB' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const parsed = parseEarningsFile(buffer)

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gagal memproses file penghasilan',
          details: parsed.errors,
        },
        { status: 400 }
      )
    }

    if (parsed.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak ada baris data penghasilan yang ditemukan',
        },
        { status: 400 }
      )
    }

    const result = await insertEarnings(
      parsed.rows,
      file.name,
      file.size
    )

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        skuRowsSkipped: parsed.totalRows - parsed.rows.length,
      },
    })
  } catch (error) {
    console.error('Import earnings error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal import file penghasilan',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
