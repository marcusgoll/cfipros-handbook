import * as Sentry from '@sentry/nextjs';

export type APIError = {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
};

export class ACSExtractorError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ACSExtractorError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const ErrorCodes = {
  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',

  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Processing Errors
  TEXT_EXTRACTION_FAILED: 'TEXT_EXTRACTION_FAILED',
  QUESTION_PARSING_FAILED: 'QUESTION_PARSING_FAILED',
  ACS_MATCHING_FAILED: 'ACS_MATCHING_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',

  // Database Errors
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  DATABASE_OPERATION_FAILED: 'DATABASE_OPERATION_FAILED',

  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_SESSION_ID: 'INVALID_SESSION_ID',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FREE_TIER_LIMIT_EXCEEDED: 'FREE_TIER_LIMIT_EXCEEDED',

  // External Service Errors
  OCR_SERVICE_UNAVAILABLE: 'OCR_SERVICE_UNAVAILABLE',
  PDF_PROCESSING_FAILED: 'PDF_PROCESSING_FAILED',

  // General Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

export class ErrorHandler {
  static createError(
    code: keyof typeof ErrorCodes,
    message: string,
    statusCode: number = 500,
    details?: any,
  ): ACSExtractorError {
    return new ACSExtractorError(ErrorCodes[code], message, statusCode, details);
  }

  static handleFileUploadError(error: any): ACSExtractorError {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return this.createError(
        'FILE_TOO_LARGE',
        'File size exceeds maximum limit of 10MB',
        400,
        { maxSize: '10MB', received: error.field },
      );
    }

    if (error.code === 'INVALID_FILE_TYPE') {
      return this.createError(
        'INVALID_FILE_TYPE',
        'File type not supported. Please upload PDF, text, or image files.',
        400,
        { supportedTypes: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'] },
      );
    }

    return this.createError(
      'FILE_UPLOAD_FAILED',
      'Failed to upload file. Please try again.',
      500,
      error,
    );
  }

  static handleProcessingError(error: any): ACSExtractorError {
    if (error.name === 'TextExtractionError') {
      return this.createError(
        'TEXT_EXTRACTION_FAILED',
        'Failed to extract text from file. File may be corrupted or in unsupported format.',
        422,
        error,
      );
    }

    if (error.name === 'QuestionParsingError') {
      return this.createError(
        'QUESTION_PARSING_FAILED',
        'Failed to parse questions from extracted text. File format may not be supported.',
        422,
        error,
      );
    }

    if (error.name === 'ACSMatchingError') {
      return this.createError(
        'ACS_MATCHING_FAILED',
        'Failed to match questions to ACS codes. Analysis may be incomplete.',
        422,
        error,
      );
    }

    return this.createError(
      'ANALYSIS_FAILED',
      'Failed to analyze uploaded content. Please try again.',
      500,
      error,
    );
  }

  static handleValidationError(error: any): ACSExtractorError {
    if (error.name === 'ZodError') {
      const details = error.issues.map((issue: any) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      return this.createError(
        'INVALID_INPUT',
        'Request validation failed',
        400,
        { validationErrors: details },
      );
    }

    return this.createError(
      'INVALID_INPUT',
      error.message || 'Invalid input provided',
      400,
      error,
    );
  }

  static handleDatabaseError(error: any): ACSExtractorError {
    if (error.code === 'ECONNREFUSED') {
      return this.createError(
        'DATABASE_CONNECTION_FAILED',
        'Unable to connect to database. Please try again later.',
        503,
        error,
      );
    }

    if (error.code === '23505') { // PostgreSQL unique violation
      return this.createError(
        'DATABASE_OPERATION_FAILED',
        'Resource already exists',
        409,
        error,
      );
    }

    return this.createError(
      'DATABASE_OPERATION_FAILED',
      'Database operation failed. Please try again.',
      500,
      error,
    );
  }

  static handleAuthError(error: any): ACSExtractorError {
    if (error.message?.includes('unauthorized')) {
      return this.createError(
        'UNAUTHORIZED',
        'Authentication required. Please log in.',
        401,
        error,
      );
    }

    if (error.message?.includes('forbidden')) {
      return this.createError(
        'INSUFFICIENT_PERMISSIONS',
        'Insufficient permissions to perform this action.',
        403,
        error,
      );
    }

    return this.createError(
      'UNAUTHORIZED',
      'Authentication failed',
      401,
      error,
    );
  }

  static logError(error: ACSExtractorError | Error, context?: any): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      ...(error instanceof ACSExtractorError && {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      }),
      context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ACS Extractor Error:', errorInfo);
    }

    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        feature: 'acs-extractor',
        ...(error instanceof ACSExtractorError && { errorCode: error.code }),
      },
      extra: errorInfo,
    });
  }

  static createAPIResponse(error: ACSExtractorError): Response {
    const response: APIError = {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };

    // Don't expose sensitive details in production
    if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
      response.details = undefined;
      if (error.statusCode === 500) {
        response.message = 'Internal server error occurred';
      }
    }

    return new Response(JSON.stringify({ error: response }), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    errorHandler?: (error: any) => ACSExtractorError,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const handledError = errorHandler
        ? errorHandler(error)
        : this.createError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', 500, error);

      this.logError(handledError, { operation: operation.name });
      throw handledError;
    }
  }

  static retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      let lastError: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await operation();
          resolve(result);
          return;
        } catch (error) {
          lastError = error;

          if (attempt === maxRetries) {
            break;
          }

          // Don't retry on certain error types
          if (error instanceof ACSExtractorError) {
            if ([400, 401, 403, 404, 422].includes(error.statusCode)) {
              break;
            }
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }

      reject(lastError);
    });
  }
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: any) => ACSExtractorError,
) {
  return async (...args: T): Promise<R> => {
    return ErrorHandler.handleAsyncOperation(() => fn(...args), errorHandler);
  };
}

export function createErrorResponse(error: unknown): Response {
  let handledError: ACSExtractorError;

  if (error instanceof ACSExtractorError) {
    handledError = error;
  } else if (error instanceof Error) {
    handledError = ErrorHandler.createError(
      'INTERNAL_SERVER_ERROR',
      error.message,
      500,
      error,
    );
  } else {
    handledError = ErrorHandler.createError(
      'INTERNAL_SERVER_ERROR',
      'An unknown error occurred',
      500,
      error,
    );
  }

  ErrorHandler.logError(handledError);
  return ErrorHandler.createAPIResponse(handledError);
}
