import React from "react";
import ControlsPanel from "../components/controls/ControlsPanel";
import { useBinanceAllTickers } from "../hooks/useBinanceAllTickers";
import KpiCards from "../components/widgets/KpiCards";
import TopMovers from "../components/widgets/TopMovers";
import MarketTable from "../components/widgets/MarketTable";

export default function Dashboard(){
  const { list, metrics, topGainers, topLosers } = useBinanceAllTickers();
  return (<div className="page">
    <header><h1>Realtime Futures All Market Tickers</h1>
      <p>Binance WebSocket: <code>wss://fstream.binance.com/ws/!ticker@arr</code> — instant snapshot (no time window, no aggregation).</p>
    </header>
    <ControlsPanel />
    <KpiCards metrics={metrics} />
    <section className="row"><TopMovers gainers={topGainers} losers={topLosers} /></section>
    <section className="row"><MarketTable rows={list} /></section>
  </div>);
}
