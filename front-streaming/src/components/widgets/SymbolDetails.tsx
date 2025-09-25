import React from "react";
import type { TickerNumeric } from "../../lib/binanceTypes";
import { fmtNum, fmtPct } from "../../lib/format";
import "./widgets.css";

type Props = { data?: TickerNumeric };

export default function SymbolDetails({ data }: Props) {
  if (!data) return null;
  return (
    <div className="symbol-kpis">
      <div className="item"><div className="label">Last price</div><div className="value">{fmtNum(data.lastPrice)}</div></div>
      <div className="item"><div className="label">Price change (%)</div><div className="value">{fmtPct(data.priceChangePercent)}</div></div>
      <div className="item"><div className="label">Total traded quote asset volume (24h)</div><div className="value">{fmtNum(data.quoteVolume24h)}</div></div>
      <div className="item"><div className="label">Total number of trades (24h)</div><div className="value">{fmtNum(data.tradeCount24h, 0)}</div></div>
      <div className="item"><div className="label">High / Low (24h)</div><div className="value">{fmtNum(data.highPrice)} / {fmtNum(data.lowPrice)}</div></div>
    </div>
  );
}
