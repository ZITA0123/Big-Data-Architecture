import { useEffect, useMemo, useRef, useState } from 'react';
import type { Binance24hrTicker, TickerNumeric } from '../lib/binanceTypes';
import { toNumber } from '../lib/format';
import { useControls } from '../store/controlsStore';

const WS_URL = 'wss://fstream.binance.com/ws/!ticker@arr';

export type DerivedMetrics = {
  breadthUpPct: number;     // % up vs total (P>0)
  totalTrades24h: number;   // Σ n
  tradeRatePerSec: number;  // ΔΣn / Δt
  maxLastPrice: number;     // max lastPrice
  minLastPrice: number;     // min lastPrice
};

export function useBinanceAllTickers() {
  const { watchlist, sortBy, topN } = useControls();

  const mapRef = useRef<Map<string, TickerNumeric>>(new Map());
  const [version, setVersion] = useState(0); // trigger UI flush

  // for trade rate
  const prevSumRef = useRef<{ ts: number; sumN: number }>({ ts: Date.now(), sumN: 0 });
  const [tradeRate, setTradeRate] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let alive = true;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        // noop
      };

      ws.onmessage = (ev) => {
        const now = Date.now();
        try {
          const parsed = JSON.parse(ev.data);
          if (Array.isArray(parsed)) {
            for (const t of parsed as Binance24hrTicker[]) {
              const item: TickerNumeric = {
                eventType: t.e,
                eventTime: t.E,
                symbol: t.s,
                priceChange: toNumber(t.p),
                priceChangePercent: toNumber(t.P),
                weightedAvgPrice: toNumber(t.w),
                lastPrice: toNumber(t.c),
                lastQty: toNumber(t.Q),
                openPrice: toNumber(t.o),
                highPrice: toNumber(t.h),
                lowPrice: toNumber(t.l),
                baseVolume24h: toNumber(t.v),
                quoteVolume24h: toNumber(t.q),
                statsOpenTime: t.O,
                statsCloseTime: t.C,
                firstTradeId: t.F,
                lastTradeId: t.L,
                tradeCount24h: t.n,
                lastSeenAt: now,
              };
              mapRef.current.set(item.symbol, item);
            }
          }
        } catch (e) {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!alive) return;
        // Reconnect with simple backoff
        setTimeout(connect, 1000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    // Flush UI at a fixed cadence (no aggregation; just render latest)
    const flush = setInterval(() => setVersion((v) => v + 1), 500);

    return () => {
      alive = false;
      clearInterval(flush);
      ws?.close();
    };
  }, []);

  // Build filtered list and metrics on each flush
  const { list, metrics } = useMemo(() => {
    const all = Array.from(mapRef.current.values());

    // Filter by watchlist if provided
    const filtered = watchlist.length
      ? all.filter((x) => {
          const S = x.symbol.toUpperCase();
          return watchlist.some((w) => S.includes(w.toUpperCase()));
        })
      : all;

    // Instantaneous metrics
    const totalTrades24h = filtered.reduce((acc, x) => acc + (x.tradeCount24h || 0), 0);
    const ups = filtered.reduce((acc, x) => acc + (x.priceChangePercent > 0 ? 1 : 0), 0);
    const breadthUpPct = filtered.length ? (ups / filtered.length) * 100 : 0;
    const maxLastPrice = filtered.reduce((m, x) => (x.lastPrice > m ? x.lastPrice : m), Number.NEGATIVE_INFINITY);
    const minLastPrice = filtered.reduce((m, x) => (x.lastPrice < m ? x.lastPrice : m), Number.POSITIVE_INFINITY);

    // trade rate (ΔΣn/Δt)
    const now = Date.now();
    const prev = prevSumRef.current;
    if (now > prev.ts) {
      const rate = (totalTrades24h - prev.sumN) / ((now - prev.ts) / 1000);
      setTradeRate(Number.isFinite(rate) ? Math.max(0, rate) : 0);
      prevSumRef.current = { ts: now, sumN: totalTrades24h };
    }

    // Sort for table by current sortBy
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'P') return (b.priceChangePercent || 0) - (a.priceChangePercent || 0);
      if (sortBy === 'q') return (b.quoteVolume24h || 0) - (a.quoteVolume24h || 0);
      return (b.tradeCount24h || 0) - (a.tradeCount24h || 0); // 'n'
    });

    const list = sorted.slice(0, topN);

    const metrics: DerivedMetrics = {
      breadthUpPct,
      totalTrades24h,
      tradeRatePerSec: tradeRate,
      maxLastPrice: Number.isFinite(maxLastPrice) ? maxLastPrice : 0,
      minLastPrice: Number.isFinite(minLastPrice) ? minLastPrice : 0,
    };

    return { list, metrics };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, watchlist, sortBy, topN]);

  // For Top Movers (gainers/losers) always compute from the same filtered pool
  const topGainers = useMemo(() => {
    const poolAll = Array.from(mapRef.current.values());
    const pool = watchlist.length
      ? poolAll.filter(x => watchlist.some(w => x.symbol.toUpperCase().includes(w.toUpperCase())))
      : poolAll;
    return [...pool]
      .sort((a, b) => (b.priceChangePercent || 0) - (a.priceChangePercent || 0))
      .slice(0, topN);
  }, [version, watchlist, topN]);

  const topLosers = useMemo(() => {
    const poolAll = Array.from(mapRef.current.values());
    const pool = watchlist.length
      ? poolAll.filter(x => watchlist.some(w => x.symbol.toUpperCase().includes(w.toUpperCase())))
      : poolAll;
    return [...pool]
      .sort((a, b) => (a.priceChangePercent || 0) - (b.priceChangePercent || 0))
      .slice(0, topN);
  }, [version, watchlist, topN]);

  return { list, metrics, topGainers, topLosers };
}