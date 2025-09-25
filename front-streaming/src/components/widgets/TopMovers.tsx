import React, { useMemo } from "react";
import type { TickerNumeric } from "../../lib/binanceTypes";
import { fmtPct } from "../../lib/format";
import "./widgets.css";

type Props = {
  gainers: TickerNumeric[];
  losers: TickerNumeric[];
};

export default function TopMovers({ gainers, losers }: Props) {
  const maxAbs = useMemo(() => {
    const g = gainers.length ? Math.max(...gainers.map((x) => Math.abs(x.priceChangePercent))) : 0;
    const l = losers.length ? Math.max(...losers.map((x) => Math.abs(x.priceChangePercent))) : 0;
    return Math.max(g, l, 1);
  }, [gainers, losers]);

  return (
    <div className="topmovers">
      <div className="panel">
        <div className="panel-title">Top Gainers (Price change %)</div>
        <ul className="bars">
          {gainers.map((x) => (
            <li key={x.symbol}>
              {/* label avec tooltip : nom complet survolable */}
              <span className="label" title={x.symbol}>{x.symbol}</span>
              <div className="bar pos" style={{ width: `${(Math.abs(x.priceChangePercent) / maxAbs) * 100}%` }} />
              <span className="val">{fmtPct(x.priceChangePercent)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <div className="panel-title">Top Losers (Price change %)</div>
        <ul className="bars">
          {losers.map((x) => (
            <li key={x.symbol}>
              <span className="label" title={x.symbol}>{x.symbol}</span>
              <div className="bar neg" style={{ width: `${(Math.abs(x.priceChangePercent) / maxAbs) * 100}%` }} />
              <span className="val">{fmtPct(x.priceChangePercent)}</span>
            </li>
          ))}  
        </ul>
      </div>
    </div>
  );
}
