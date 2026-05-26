// src/lib/data-providers/index.ts

import { MockDataProvider } from './mock.provider';
import { BrightDataProvider } from './brightdata.provider';
import { BrightDataSerpProvider } from './brightdata-serp.provider';
import type { IDataProvider } from './types';

/**
 * Factory function to instantiate and return the correct data provider
 * based on the DATA_PROVIDER environment variable.
 */
export function getDataProvider(): IDataProvider {
  const providerMode = process.env.DATA_PROVIDER || 'mock';

  console.log(`[Data Provider] Initializing mode: ${providerMode.toUpperCase()}`);

  switch (providerMode) {
    case 'brightdata':
      // The class itself handles missing tokens and fallback logic
      return new BrightDataProvider();

    case 'brightdata-serp':
      // The class itself handles missing tokens and fallback logic
      return new BrightDataSerpProvider();

    case 'mock':
    default:
      // Always safe fallback
      return new MockDataProvider();
  }
}