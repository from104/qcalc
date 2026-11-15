/**
 * 네트워크 고정 — 환율 API 를 고정 환율로 대답하고, 그 밖의 외부 요청은 끊는다.
 *
 * 앱은 시작할 때와 환율 탭에서 src/core/converters/CurrencyConverter.ts 의 세 주소를 부른다.
 * 실제 환율은 매일 바뀌므로 시험에서는 아래 FIXED_RATES(EUR 기준)로 대답한다.
 * 두 출처가 같은 값을 돌려주므로 어느 쪽이 이기든 결과가 같다.
 */
import type { BrowserContext, Page, Route } from '@playwright/test';

/** EUR 1 단위당 환율 — 환산 기대값은 이 표로 계산한다 (예: 1 USD = 1500/1.1 KRW) */
export const FIXED_RATES: Readonly<Record<string, number>> = {
  USD: 1.1,
  KRW: 1500,
  JPY: 160,
  GBP: 0.85,
  CNY: 7.8,
  CAD: 1.5,
  AUD: 1.65,
  CHF: 0.95,
};

const FRANKFURTER = /^https:\/\/api\.frankfurter\.dev\//;
const CURRENCY_API = /^https:\/\/latest\.currency-api\.pages\.dev\//;
const JSDELIVR_CURRENCY = /^https:\/\/cdn\.jsdelivr\.net\/npm\/@fawazahmed0\/currency-api/;

export interface NetworkMockOptions {
  /** 환율 표를 바꿀 때 (EUR 기준) */
  rates?: Record<string, number>;
  /** true 면 환율 API 가 모두 실패한다 — 빌드 시점 예비 환율 경로 시험용 */
  failRates?: boolean;
  /** 외부(127.0.0.1/localhost 아닌) 요청을 끊을지 (기본 true) */
  blockExternal?: boolean;
}

function json(route: Route, body: unknown) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  });
}

/** 컨텍스트(또는 페이지)에 환율 고정·외부 차단 라우트를 건다 */
export async function mockNetwork(target: BrowserContext | Page, options: NetworkMockOptions = {}): Promise<void> {
  const rates = options.rates ?? FIXED_RATES;
  const date = '2026-01-02';

  await target.route(
    (url) => /^https?:$/.test(url.protocol) && !['127.0.0.1', 'localhost'].includes(url.hostname),
    async (route) => {
      const url = route.request().url();
      if (FRANKFURTER.test(url)) {
        if (options.failRates) return route.fulfill({ status: 503, body: 'mock outage' });
        return json(route, { amount: 1, base: 'EUR', date, rates });
      }
      if (CURRENCY_API.test(url) || JSDELIVR_CURRENCY.test(url)) {
        if (options.failRates) return route.fulfill({ status: 503, body: 'mock outage' });
        const eur = Object.fromEntries(Object.entries(rates).map(([k, v]) => [k.toLowerCase(), v]));
        return json(route, { date, eur });
      }
      if (options.blockExternal === false) return route.continue();
      return route.abort('blockedbyclient');
    },
  );
}
