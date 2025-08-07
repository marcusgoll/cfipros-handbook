import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createErrorResponse, ErrorHandler } from '@/lib/error-handling';

const mockACSCodes = [
  {
    id: 1,
    code: 'PA.I.A.K1',
    title: 'Certification and documents',
    description: 'Required pilot and aircraft certificates, documents, and records',
    category: 'Preflight Preparation',
    performance: 85,
    attempts: 5,
    lastAttempt: '2024-01-15',
    difficulty: 'Easy',
    masteryLevel: 'Proficient',
  },
  {
    id: 2,
    code: 'PA.I.B.K2',
    title: 'Airworthiness requirements',
    description: 'Aircraft airworthiness requirements, to include airplane certificates',
    category: 'Preflight Preparation',
    performance: 60,
    attempts: 8,
    lastAttempt: '2024-01-14',
    difficulty: 'Medium',
    masteryLevel: 'Developing',
  },
  {
    id: 3,
    code: 'PA.II.A.K1',
    title: 'Weather information',
    description: 'Sources of weather data for flight planning',
    category: 'Preflight Procedures',
    performance: 45,
    attempts: 12,
    lastAttempt: '2024-01-13',
    difficulty: 'Hard',
    masteryLevel: 'Needs Improvement',
  },
  {
    id: 4,
    code: 'PA.III.A.K1',
    title: 'Normal and crosswind takeoff',
    description: 'Elements related to normal and crosswind takeoff',
    category: 'Airport and Seaplane Base Operations',
    performance: 90,
    attempts: 3,
    lastAttempt: '2024-01-12',
    difficulty: 'Easy',
    masteryLevel: 'Mastered',
  },
  {
    id: 5,
    code: 'PA.IV.A.K2',
    title: 'Straight-and-level flight',
    description: 'Relationship of pitch, bank, power, trim, and airspeed',
    category: 'Takeoffs, Landings, and Go-Arounds',
    performance: 75,
    attempts: 6,
    lastAttempt: '2024-01-11',
    difficulty: 'Medium',
    masteryLevel: 'Proficient',
  },
];

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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const performance = searchParams.get('performance') || '';

    if (!sessionId) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Session ID required',
        400,
      );
    }

    let filteredCodes = mockACSCodes;

    if (search) {
      filteredCodes = filteredCodes.filter(code =>
        code.code.toLowerCase().includes(search.toLowerCase())
        || code.title.toLowerCase().includes(search.toLowerCase())
        || code.description.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category) {
      filteredCodes = filteredCodes.filter(code =>
        code.category === category,
      );
    }

    if (performance) {
      const perfFilter = performance.toLowerCase();
      filteredCodes = filteredCodes.filter((code) => {
        if (perfFilter === 'high') {
          return code.performance >= 80;
        }
        if (perfFilter === 'medium') {
          return code.performance >= 60 && code.performance < 80;
        }
        if (perfFilter === 'low') {
          return code.performance < 60;
        }
        return true;
      });
    }

    const categories = [...new Set(mockACSCodes.map(code => code.category))];

    const analytics = {
      totalCodes: mockACSCodes.length,
      averagePerformance: Math.round(mockACSCodes.reduce((sum, code) => sum + code.performance, 0) / mockACSCodes.length),
      masteryDistribution: {
        'Mastered': mockACSCodes.filter(c => c.masteryLevel === 'Mastered').length,
        'Proficient': mockACSCodes.filter(c => c.masteryLevel === 'Proficient').length,
        'Developing': mockACSCodes.filter(c => c.masteryLevel === 'Developing').length,
        'Needs Improvement': mockACSCodes.filter(c => c.masteryLevel === 'Needs Improvement').length,
      },
      categoryPerformance: categories.map(cat => ({
        category: cat,
        average: Math.round(
          mockACSCodes
            .filter(c => c.category === cat)
            .reduce((sum, c) => sum + c.performance, 0)
            / mockACSCodes.filter(c => c.category === cat).length,
        ),
        count: mockACSCodes.filter(c => c.category === cat).length,
      })),
    };

    return NextResponse.json({
      success: true,
      codes: filteredCodes,
      analytics,
      categories,
      pagination: {
        total: filteredCodes.length,
        page: 1,
        pageSize: filteredCodes.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
