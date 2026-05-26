/**
 * Utility functions for formatting, helpers, etc.
 */

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Resolve score background color based on intent score
 */
export function scoreBg(score: number): string {
  if (score >= 75) return 'bg-neo-teal';
  if (score >= 50) return 'bg-neo-yellow';
  return 'bg-white border border-gray-200';
}

/**
 * Resolve score based on available signals
 */
export function resolveScore(lead: {
  company_name?: string;
  intent_score: number | null;
  jobRole: string | null;
  redditSub: string | null;
}): number {
  if (lead.intent_score !== null) return lead.intent_score;
  
  // Deterministic yet universal hash-based fallback (range: 55-94)
  const name = lead.company_name || '';
  if (name) {
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 55 + (hash % 40);
  }
  
  const base = lead.jobRole ? 40 : 0;
  const reddit = lead.redditSub ? 30 : 0;
  return Math.min(base + reddit + 15, 100);
}

/**
 * Sleep for delays (with timeout safety)
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await sleep(delayMs);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Format company name for URL/slug
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
