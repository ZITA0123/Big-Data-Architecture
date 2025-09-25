import React, { useMemo } from "react";
import ControlsPanel from "../components/controls/ControlsPanel";
import { useBinanceAllTickers } from "../hooks/useBinanceAllTickers";
import KpiCards from "../components/widgets/KpiCards";
import TopMovers from "../components/widgets/TopMovers";
import MarketTable from "../components/widgets/MarketTable";
import SymbolLine from "../components/widgets/SymbolLine";
import SymbolDetails from "../components/widgets/SymbolDetails";
import { useControls } from "../store/controlsStore";

export default function Dashboard() {
  const { list, metrics, topGainers, topLosers, getSeries, getTicker, version } =
    useBinanceAllTickers();
  const { selectedSymbol } = useControls(); // <- pas de setSelectedSymbol ici

  const series = useMemo(
    () => getSeries(selectedSymbol || null),
    [version, selectedSymbol]
  );
  const ticker = useMemo(
    () => getTicker(selectedSymbol || null),
    [version, selectedSymbol]
  );

  return (
    <div className="page">
      <header>
        <h1>Realtime Futures All Market Tickers</h1>
        <p>
          Binance WebSocket: <code>wss://fstream.binance.com/ws/!ticker@arr</code> — instant
          snapshot (no time window, no aggregation).
        </p>
      </header>

      <ControlsPanel />
      <KpiCards metrics={metrics} />

      <section className="row">
        <TopMovers gainers={topGainers} losers={topLosers} />
      </section>

      <section className="row">
        <MarketTable rows={list} />
      </section>

      {/* Le chart n'apparaît que si un symbole est sélectionné, et il est en bas */}
      {selectedSymbol && (
        <section className="row">
          <SymbolLine symbol={selectedSymbol} series={series} />
          <SymbolDetails data={ticker} />
        </section>
      )}
    </div>
  );
}
