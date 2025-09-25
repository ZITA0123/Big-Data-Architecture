import { useEffect, useMemo, useRef, useState } from "react";
import type { Binance24hrTicker, TickerNumeric } from "../lib/binanceTypes";
import { toNumber } from "../lib/format";
import { useControls } from "../store/controlsStore";

const WS_URL = "wss://fstream.binance.com/ws/!ticker@arr";

export type DerivedMetrics = {
  breadthUpPct: number;
  totalTrades24h: number;
  tradeRatePerSec: number;
  maxLastPrice: number;
  minLastPrice: number;
};

export type LinePoint = { time: number; value: number }; // time = epoch seconds

export function useBinanceAllTickers() {
  const { watchlist, sortBy, topN } = useControls();

  const mapRef = useRef<Map<string, TickerNumeric>>(new Map());
  // Série par symbole: **Price change (%)**
  const seriesRef = useRef<Map<string, LinePoint[]>>(new Map());
  const MAX_POINTS = 600; // ~5–10 min selon cadence

  const [version, setVersion] = useState(0);

  // pour le taux de trades (/s)
  const prevSumRef = useRef<{ ts: number; sumN: number }>({
    ts: Date.now(),
    sumN: 0,
  });
  const [tradeRate, setTradeRate] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let alive = true;

    const connect = () => {
      ws = new WebSocket(WS_URL);

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
                priceChangePercent: toNumber(t.P), // <-- % (noté P chez Binance)
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

              // --- Série: Price change (%) ---
              const s = seriesRef.current.get(item.symbol) ?? [];
              // Lightweight Charts attend time en **secondes**
              const point: LinePoint = {
                time: Math.floor(item.eventTime / 1000),
                value: item.priceChangePercent,
              };
              // évite les doublons sur la même seconde
              if (!s.length || s[s.length - 1].time !== point.time) {
                s.push(point);
                if (s.length > MAX_POINTS) s.shift();
                seriesRef.current.set(item.symbol, s);
              }
            }
          }
        } catch {
          // ignorer les messages malformés
        }
      };

      ws.onclose = () => {
        if (!alive) return;
        setTimeout(connect, 1000); // reconnect simple
      };

      ws.onerror = () => ws?.close();
    };

    connect();

    // Flush UI régulier (seulement rendu, aucune agrégation)
    const flush = setInterval(() => setVersion((v) => v + 1), 500);

    return () => {
      alive = false;
      clearInterval(flush);
      ws?.close();
    };
  }, []);

  // Liste + KPIs instantanés (univers filtré)
  const { list, metrics } = useMemo(() => {
    const all = Array.from(mapRef.current.values());

    const filtered = watchlist.length
      ? all.filter((x) => {
          const S = x.symbol.toUpperCase();
          return watchlist.some((w) => S.includes(w.toUpperCase())); // sous-chaîne
        })
      : all;

    const totalTrades24h = filtered.reduce((acc, x) => acc + (x.tradeCount24h || 0), 0);
    const ups = filtered.reduce((acc, x) => acc + (x.priceChangePercent > 0 ? 1 : 0), 0);
    const breadthUpPct = filtered.length ? (ups / filtered.length) * 100 : 0;
    const maxLastPrice = filtered.reduce(
      (m, x) => (x.lastPrice > m ? x.lastPrice : m),
      Number.NEGATIVE_INFINITY
    );
    const minLastPrice = filtered.reduce(
      (m, x) => (x.lastPrice < m ? x.lastPrice : m),
      Number.POSITIVE_INFINITY
    );

    const now = Date.now();
    const prev = prevSumRef.current;
    if (now > prev.ts) {
      const rate = (totalTrades24h - prev.sumN) / ((now - prev.ts) / 1000);
      setTradeRate(Number.isFinite(rate) ? Math.max(0, rate) : 0);
      prevSumRef.current = { ts: now, sumN: totalTrades24h };
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "P") return (b.priceChangePercent || 0) - (a.priceChangePercent || 0);
      if (sortBy === "q") return (b.quoteVolume24h || 0) - (a.quoteVolume24h || 0);
      return (b.tradeCount24h || 0) - (a.tradeCount24h || 0);
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
  }, [version, watchlist, sortBy, topN]);

  // Top movers (instantané)
  const topGainers = (() => {
    const wl = useControls.getState().watchlist;
    const pool = wl.length
      ? Array.from(mapRef.current.values()).filter((x) =>
          wl.some((w) => x.symbol.toUpperCase().includes(w.toUpperCase()))
        )
      : Array.from(mapRef.current.values());
    return [...pool]
      .sort((a, b) => (b.priceChangePercent || 0) - (a.priceChangePercent || 0))
      .slice(0, useControls.getState().topN);
  })();

  const topLosers = (() => {
    const wl = useControls.getState().watchlist;
    const pool = wl.length
      ? Array.from(mapRef.current.values()).filter((x) =>
          wl.some((w) => x.symbol.toUpperCase().includes(w.toUpperCase()))
        )
      : Array.from(mapRef.current.values());
    return [...pool]
      .sort((a, b) => (a.priceChangePercent || 0) - (b.priceChangePercent || 0))
      .slice(0, useControls.getState().topN);
  })();

  // Accès aux séries et au snapshot d’un symbole
  const getSeries = (symbol: string | null) => {
    if (!symbol) return [];
    return seriesRef.current.get(symbol) ?? [];
  };
  const getTicker = (symbol: string | null) => {
    if (!symbol) return undefined;
    return mapRef.current.get(symbol);
  };

  return { list, metrics, topGainers, topLosers, getSeries, getTicker, version };
}
