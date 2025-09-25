import { useEffect, useMemo, useRef, useState } from "react";
import type { Binance24hrTicker, TickerNumeric } from "../lib/binanceTypes";
import { toNumber } from "../lib/format";
import { useControls } from "../store/controlsStore";
const WS_URL = "wss://fstream.binance.com/ws/!ticker@arr";
export type DerivedMetrics = { breadthUpPct:number; totalTrades24h:number; tradeRatePerSec:number; maxLastPrice:number; minLastPrice:number; };
export function useBinanceAllTickers(){
  const { watchlist, sortBy, topN } = useControls();
  const mapRef = useRef<Map<string, TickerNumeric>>(new Map());
  const [version, setVersion] = useState(0);
  const prevSumRef = useRef<{ts:number;sumN:number}>({ts:Date.now(),sumN:0});
  const [tradeRate, setTradeRate] = useState(0);
  useEffect(()=>{
    let ws:WebSocket|null=null; let alive=true;
    const connect=()=>{
      ws=new WebSocket(WS_URL);
      ws.onmessage=(ev)=>{ const now=Date.now(); try{ const parsed=JSON.parse(ev.data); if(Array.isArray(parsed)){ for(const t of parsed as Binance24hrTicker[]){ const item:TickerNumeric={ eventType:t.e,eventTime:t.E,symbol:t.s,priceChange:toNumber(t.p),priceChangePercent:toNumber(t.P),weightedAvgPrice:toNumber(t.w),lastPrice:toNumber(t.c),lastQty:toNumber(t.Q),openPrice:toNumber(t.o),highPrice:toNumber(t.h),lowPrice:toNumber(t.l),baseVolume24h:toNumber(t.v),quoteVolume24h:toNumber(t.q),statsOpenTime:t.O,statsCloseTime:t.C,firstTradeId:t.F,lastTradeId:t.L,tradeCount24h:t.n,lastSeenAt:now}; mapRef.current.set(item.symbol,item);} } }catch{} };
      ws.onclose=()=>{ if(!alive)return; setTimeout(connect,1000); };
      ws.onerror=()=>{ ws?.close(); };
    };
    connect();
    const flush=setInterval(()=>setVersion(v=>v+1),500);
    return ()=>{ alive=false; clearInterval(flush); ws?.close(); };
  },[]);
  const { list, metrics } = useMemo(()=>{
    const all = Array.from(mapRef.current.values());
    const filtered = watchlist.length ? all.filter(x=>watchlist.some(w=>x.symbol.toUpperCase().includes(w.toUpperCase()))) : all;
    const totalTrades24h = filtered.reduce((a,x)=>a+(x.tradeCount24h||0),0);
    const ups = filtered.reduce((a,x)=>a+(x.priceChangePercent>0?1:0),0);
    const breadthUpPct = filtered.length ? (ups/filtered.length)*100 : 0;
    const maxLastPrice = filtered.reduce((m,x)=>x.lastPrice>m?x.lastPrice:m, Number.NEGATIVE_INFINITY);
    const minLastPrice = filtered.reduce((m,x)=>x.lastPrice<m?x.lastPrice:m, Number.POSITIVE_INFINITY);
    const now=Date.now(); const prev=prevSumRef.current;
    if(now>prev.ts){ const rate=(totalTrades24h - prev.sumN)/((now-prev.ts)/1000); setTradeRate(Number.isFinite(rate)?Math.max(0,rate):0); prevSumRef.current={ts:now,sumN:totalTrades24h}; }
    const sorted=[...filtered].sort((a,b)=> sortBy==="P" ? (b.priceChangePercent||0)-(a.priceChangePercent||0) : sortBy==="q" ? (b.quoteVolume24h||0)-(a.quoteVolume24h||0) : (b.tradeCount24h||0)-(a.tradeCount24h||0) );
    return { list: sorted.slice(0, topN), metrics: { breadthUpPct, totalTrades24h, tradeRatePerSec: tradeRate, maxLastPrice: Number.isFinite(maxLastPrice)?maxLastPrice:0, minLastPrice:Number.isFinite(minLastPrice)?minLastPrice:0 } };
  },[version,watchlist,sortBy,topN]);
  const topGainers = useMemo(()=>{ const poolAll=Array.from(mapRef.current.values()); const pool=watchlist.length?poolAll.filter(x=>watchlist.some(w=>x.symbol.toUpperCase().includes(w.toUpperCase()))):poolAll; return [...pool].sort((a,b)=>(b.priceChangePercent||0)-(a.priceChangePercent||0)).slice(0,topN); },[version,watchlist,topN]);
  const topLosers = useMemo(()=>{ const poolAll=Array.from(mapRef.current.values()); const pool=watchlist.length?poolAll.filter(x=>watchlist.some(w=>x.symbol.toUpperCase().includes(w.toUpperCase()))):poolAll; return [...pool].sort((a,b)=>(a.priceChangePercent||0)-(b.priceChangePercent||0)).slice(0,topN); },[version,watchlist,topN]);
  return { list, metrics, topGainers, topLosers };
}
