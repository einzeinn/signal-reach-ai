/**
 * Environment validation at module load on the server.
 * Keep this aligned with the env vars actually used across providers.
 */

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
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (providerType === 'brightdata' && !process.env.BRIGHTDATA_API_TOKEN) {
    missing.push('BRIGHTDATA_API_TOKEN');
  }

  if (providerType === 'brightdata-serp') {
    if (!process.env.BRIGHTDATA_API_TOKEN) {
      missing.push('BRIGHTDATA_API_TOKEN');
    }
    if (!process.env.BRIGHTDATA_SERP_ZONE) {
      missing.push('BRIGHTDATA_SERP_ZONE');
    }
  }

  const hasAnyDatasetOverride = DATASET_ENV_KEYS.some((key) => !!process.env[key]);
  const hasAllDatasetOverrides = DATASET_ENV_KEYS.every((key) => !!process.env[key]);
  if (hasAnyDatasetOverride && !hasAllDatasetOverrides) {
    warnings.push(
      `Incomplete Bright Data dataset override. Set all of: ${DATASET_ENV_KEYS.join(', ')}.`
    );
  }

  if (process.env.USE_MOCK_PROVIDER && !process.env.DATA_PROVIDER) {
    warnings.push('USE_MOCK_PROVIDER is legacy. Prefer DATA_PROVIDER=mock.');
  }

  if (!['mock', 'brightdata', 'brightdata-serp'].includes(providerType)) {
    warnings.push(
      `Unknown DATA_PROVIDER="${providerType}". Supported values: mock, brightdata, brightdata-serp.`
    );
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    console.error('Missing required environment variables:');
    validation.missing.forEach((key) => {
      console.error(`  - ${key}`);
    });
    throw new Error(`Missing env vars: ${validation.missing.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:');
    validation.warnings.forEach((msg) => {
      console.warn(`  - ${msg}`);
    });
  }

  console.log('Environment validation passed');
}

if (typeof window === 'undefined') {
  try {
    logEnvironmentStatus();
  } catch (error) {
    console.error('Environment validation failed during startup');
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}
