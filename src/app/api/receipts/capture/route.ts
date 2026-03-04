import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageData, mimeType, fileSize } = body as {
      imageData?: string
      mimeType?: string
      fileSize?: number
    }

    // Validate required fields
    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, mimeType' },
        { status: 400 }
      )
    }

    // Validate mime type
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid mimeType: must be an image type' },
        { status: 400 }
      )
    }

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large: maximum 10MB' },
        { status: 400 }
      )
    }

    // Look up or create User record (sync Clerk user to local DB)
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      // First API call creates the DB user record
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@placeholder.local`, // Will be updated with real email later
        },
        select: { id: true },
      })
    }

    // Create CapturedReceipt record
    const receipt = await prisma.capturedReceipt.create({
      data: {
        userId: user.id,
        imageData,
        mimeType,
        fileSize: fileSize ?? null,
      },
      select: {
        id: true,
        capturedAt: true,
      },
    })

    return NextResponse.json(
      { id: receipt.id, capturedAt: receipt.capturedAt },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to save receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
