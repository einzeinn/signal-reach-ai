import { BrightDataProvider } from './brightdata.provider';

// Tambahkan kata "type" di sini untuk menghindari error isolatedModules
export type * from './types'; 

export function getDataProvider() {
  return new BrightDataProvider();
}