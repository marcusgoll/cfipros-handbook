import type { NextRequest } from 'next/server';
import type { Resource } from '@/types/resources';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createErrorResponse, ErrorHandler } from '@/lib/error-handling';

const createResourceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.enum(['checklist', 'reference', 'study-guide', 'weather', 'airport-diagrams', 'regulations', 'interactive', 'mnemonics']),
  subcategory: z.string().optional(),
  accessLevel: z.enum(['free', 'premium', 'exclusive']),
  tags: z.array(z.string()).default([]),
  metadata: z.object({
    aircraftType: z.array(z.string()).optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    author: z.string().optional(),
    estimatedReadTime: z.number().optional(),
    relatedAcsCodes: z.array(z.string()).optional(),
  }).default({}),
});

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

    // Check if user is admin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const isAdmin = user.publicMetadata?.role === 'admin';

    if (!isAdmin) {
      throw ErrorHandler.createError(
        'INSUFFICIENT_PERMISSIONS',
        'Admin privileges required',
        403,
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataJson = formData.get('metadata') as string;

    if (!file) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'File is required',
        400,
      );
    }

    if (!metadataJson) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Resource metadata is required',
        400,
      );
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataJson);
    } catch (error) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Invalid metadata JSON',
        400,
      );
    }

    const validatedData = createResourceSchema.parse(metadata);

    // Validate file
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
    ];

    if (file.size > MAX_FILE_SIZE) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'File size exceeds 50MB limit',
        400,
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Unsupported file type',
        400,
      );
    }

    // In production, upload to cloud storage (S3, etc.)
    // For now, simulate file upload
    const fileId = crypto.randomUUID();
    const fileName = `${fileId}-${file.name}`;
    const fileUrl = `/uploads/resources/${fileName}`;

    // Create resource record
    const newResource: Resource = {
      id: crypto.randomUUID(),
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      subcategory: validatedData.subcategory,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      accessLevel: validatedData.accessLevel,
      downloadCount: 0,
      tags: validatedData.tags,
      metadata: validatedData.metadata,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database

    return NextResponse.json({
      success: true,
      resource: newResource,
      message: 'Resource created successfully',
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw ErrorHandler.createError(
        'UNAUTHORIZED',
        'Authentication required',
        401,
      );
    }

    // Check if user is admin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const isAdmin = user.publicMetadata?.role === 'admin';

    if (!isAdmin) {
      throw ErrorHandler.createError(
        'INSUFFICIENT_PERMISSIONS',
        'Admin privileges required',
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '20');
    // const search = searchParams.get('search') || ''; // TODO: Use for filtering
    // const category = searchParams.get('category') || ''; // TODO: Use for filtering
    // const accessLevel = searchParams.get('accessLevel') || ''; // TODO: Use for filtering

    // TODO: Implement database query for admin resource listing
    // This would include inactive resources and additional admin metadata

    const mockAdminResources = [
      {
        id: '1',
        title: 'Cessna 172 Preflight Checklist',
        category: 'checklist',
        accessLevel: 'free',
        downloadCount: 1250,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        fileSize: 245760,
        fileType: 'application/pdf',
      },
      {
        id: '2',
        title: 'Weather Briefing Quick Reference',
        category: 'reference',
        accessLevel: 'premium',
        downloadCount: 890,
        isActive: true,
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-20T09:15:00Z',
        fileSize: 512000,
        fileType: 'application/pdf',
      },
    ];

    return NextResponse.json({
      resources: mockAdminResources,
      total: mockAdminResources.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockAdminResources.length / pageSize),
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
