import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createErrorResponse, ErrorHandler } from '@/lib/error-handling';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
const FREE_TIER_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw ErrorHandler.createError(
        'UNAUTHORIZED',
        'Authentication required',
        401,
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'No files provided',
        400,
      );
    }

    if (files.length > FREE_TIER_LIMIT) {
      throw ErrorHandler.createError(
        'FREE_TIER_LIMIT_EXCEEDED',
        'Free tier allows maximum 3 files per upload',
        400,
        { limit: FREE_TIER_LIMIT, received: files.length },
      );
    }

    const validationErrors: string[] = [];
    const validatedFiles: File[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name}: File size exceeds 10MB limit`);
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name}: Unsupported file type ${file.type}`);
        continue;
      }

      validatedFiles.push(file);
    }

    if (validationErrors.length > 0) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'File validation failed',
        400,
        { validationErrors },
      );
    }

    const uploadedFiles = [];

    for (const file of validatedFiles) {
      try {
        await file.arrayBuffer();

        const fileName = `${userId}-${Date.now()}-${file.name}`;

        const fileRecord = {
          id: crypto.randomUUID(),
          userId,
          filename: fileName,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          processingStatus: 'uploaded',
          createdAt: new Date().toISOString(),
        };

        uploadedFiles.push(fileRecord);
      } catch (fileError) {
        throw ErrorHandler.handleFileUploadError(fileError);
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      limits: {
        maxFileSize: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_TYPES,
        freeTierLimit: FREE_TIER_LIMIT,
      },
    },
  );
}
