import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile } from '@/services/excel-parser.service'
import { insertOrders } from '@/services/order.service'
import { db } from '@/db'
import { importHistory } from '@/db/schema'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Format file harus .xlsx atau .xls' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 50MB' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()

    // Parse Excel
    const parseResult = parseExcelFile(buffer)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.errors[0] || 'Gagal memparse file',
          details: parseResult.errors,
          missingColumns: parseResult.missingColumns,
        },
        { status: 400 }
      )
    }

    // Insert to database
    const insertResult = await insertOrders(parseResult.orders)

    // Record import history
    await db.insert(importHistory).values({
      fileName: file.name,
      fileSize: file.size,
      recordsCount: insertResult.inserted,
      importedAt: new Date().toISOString(),
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimport ${insertResult.inserted} pesanan`,
      data: {
        totalRows: parseResult.totalRows,
        inserted: insertResult.inserted,
        skipped: insertResult.skipped,
        errors: insertResult.errors,
        fileName: file.name,
      },
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengimport file',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
