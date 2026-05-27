import { BrightDataProvider } from './brightdata.provider';
import { BrightDataSerpProvider } from './brightdata-serp.provider';

// Tambahkan kata "type" di sini untuk menghindari error isolatedModules
export type * from './types'; 

export function getDataProvider() {
  const provider = process.env.DATA_PROVIDER;
  if (provider === 'brightdata-serp') {
    return new BrightDataSerpProvider();
  }
  return new BrightDataProvider();
}