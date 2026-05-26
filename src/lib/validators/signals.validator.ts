// src/lib/validators/signals.validator.ts
// Input validation using native TypeScript (no extra dependencies)

export interface SignalsQueryParams {
  company: string;
}

export interface ScoreRequestBody {
  company: string;
}

export interface OutreachRequestBody {
  company: string;
  recipientName: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validates and sanitizes the `company` query parameter for /api/signals
 */
export function validateSignalsQuery(searchParams: URLSearchParams): ValidationResult<SignalsQueryParams> {
  const company = searchParams.get('company')?.trim();

  if (!company) {
    return { success: false, error: 'Missing required query parameter: "company"' };
  }
  if (company.length < 2) {
    return { success: false, error: 'Company name must be at least 2 characters.' };
  }
  if (company.length > 100) {
    return { success: false, error: 'Company name must be less than 100 characters.' };
  }

  return { success: true, data: { company } };
}

/**
 * Validates the request body for /api/score
 */
export function validateScoreBody(body: unknown): ValidationResult<ScoreRequestBody> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Request body must be a JSON object.' };
  }

  const { company } = body as Record<string, unknown>;

  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    return { success: false, error: 'Missing or invalid "company" field.' };
  }

  return { success: true, data: { company: company.trim() } };
}

/**
 * Validates the request body for /api/outreach
 */
export function validateOutreachBody(body: unknown): ValidationResult<OutreachRequestBody> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Request body must be a JSON object.' };
  }

  const { company, recipientName } = body as Record<string, unknown>;

  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    return { success: false, error: 'Missing or invalid "company" field.' };
  }
  if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length < 1) {
    return { success: false, error: 'Missing or invalid "recipientName" field.' };
  }

  return {
    success: true,
    data: {
      company: company.trim(),
      recipientName: recipientName.trim(),
    },
  };
}
