import { NextResponse } from 'next/server';
import { generateHandbookToc } from '@/lib/handbook-content';

export async function GET() {
  try {
    const tocData = await generateHandbookToc();
    return NextResponse.json(tocData);
  } catch (error) {
    console.error('Error generating TOC:', error);
    return NextResponse.json(
      { error: 'Failed to generate table of contents' },
      { status: 500 },
    );
  }
}
