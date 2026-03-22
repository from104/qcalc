/**
 * @file fetch-fallback-rates.ts
 * @description 빌드 전 실행하여 최신 환율 데이터를 스냅샷으로 저장합니다.
 *              네트워크 미연결 시 앱이 이 데이터를 기본값으로 사용합니다.
 *
 * 실행: npx tsx scripts/fetch-fallback-rates.ts
 */

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR';
const FAWAZAHMED0_URL = 'https://latest.currency-api.pages.dev/v1/currencies/eur.json';
const FAWAZAHMED0_FALLBACK_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';
const OUTPUT_PATH = new URL('../src/constants/CurrencyFallbackRates.json', import.meta.url);

interface RateMap {
  [key: string]: string;
}

async function fetchFrankfurter(): Promise<RateMap> {
  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) throw new Error(`Frankfurter: ${res.status}`);
  const data = await res.json();
  const rates: RateMap = {};
  for (const [k, v] of Object.entries(data.rates as Record<string, number>)) {
    rates[k] = String(v);
  }
  return rates;
}

async function fetchFawazahmed0(): Promise<RateMap> {
  let res = await fetch(FAWAZAHMED0_URL);
  if (!res.ok) {
    res = await fetch(FAWAZAHMED0_FALLBACK_URL);
    if (!res.ok) throw new Error(`fawazahmed0: ${res.status}`);
  }
  const data = await res.json();
  const rates: RateMap = {};
  for (const [k, v] of Object.entries(data.eur as Record<string, number>)) {
    rates[k.toUpperCase()] = String(v);
  }
  return rates;
}

async function main() {
  console.log('Fetching exchange rates...');

  const [frankfurterResult, fawazahmedResult] = await Promise.allSettled([fetchFrankfurter(), fetchFawazahmed0()]);

  const frankfurterRates = frankfurterResult.status === 'fulfilled' ? frankfurterResult.value : null;
  const fawazahmedRates = fawazahmedResult.status === 'fulfilled' ? fawazahmedResult.value : null;

  if (!frankfurterRates && !fawazahmedRates) {
    console.error('Both API sources failed. Fallback rates not updated.');
    process.exit(1);
  }

  const merged: RateMap = {
    ...(fawazahmedRates ?? {}),
    ...(frankfurterRates ?? {}),
    EUR: '1',
  };

  const snapshot = {
    updatedAt: new Date().toISOString(),
    base: 'EUR',
    rates: Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b))),
  };

  const { writeFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  writeFileSync(fileURLToPath(OUTPUT_PATH), JSON.stringify(snapshot, null, 2) + '\n');

  const count = Object.keys(snapshot.rates).length;
  console.log(`Saved ${count} rates to src/constants/CurrencyFallbackRates.json`);
  console.log(`Snapshot time: ${snapshot.updatedAt}`);
}

main();
