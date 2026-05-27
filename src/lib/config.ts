type ValidationResult = {
  isValid: boolean;
  missing: string[];
  warnings: string[];
};

const DATASET_ENV_KEYS = [
  'BRIGHTDATA_DATASET_LINKEDIN',
  'BRIGHTDATA_DATASET_REDDIT',
  'BRIGHTDATA_DATASET_NEWS',
] as const;

function getRequiredBaseVars(): string[] {
  return ['GEMINI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
}

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const providerType = process.env.DATA_PROVIDER ?? 'mock';

  for (const key of getRequiredBaseVars()) {
    if (!process.env[key]) missing.push(key);
  }

  if (providerType === 'brightdata' && !process.env.BRIGHTDATA_API_TOKEN) {
    missing.push('BRIGHTDATA_API_TOKEN');
  }

  if (providerType === 'brightdata-serp') {
    if (!process.env.BRIGHTDATA_API_TOKEN) missing.push('BRIGHTDATA_API_TOKEN');
    if (!process.env.BRIGHTDATA_SERP_ZONE) missing.push('BRIGHTDATA_SERP_ZONE');
  }

  const hasAnyDatasetOverride = DATASET_ENV_KEYS.some((key) => !!process.env[key]);
  const hasAllDatasetOverrides = DATASET_ENV_KEYS.every((key) => !!process.env[key]);
  if (hasAnyDatasetOverride && !hasAllDatasetOverrides) {
    warnings.push(`Incomplete Bright Data dataset override. Set all of: ${DATASET_ENV_KEYS.join(', ')}.`);
  }

  if (!['mock', 'brightdata', 'brightdata-serp'].includes(providerType)) {
    warnings.push(`Unknown DATA_PROVIDER="${providerType}".`);
  }

  return { isValid: missing.length === 0, missing, warnings };
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    console.error('Missing required environment variables:', validation.missing.join(', '));
    // ← Remove throw error, just log it
    // Cloudflare Workers does not support throwing at module level
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach((msg) => console.warn(msg));
  }

  console.log('Environment check complete. Missing:', validation.missing.join(', ') || 'none');
}

// ← REMOVE this block entirely, this was crashing Cloudflare Workers
// if (typeof window === 'undefined') { ... }