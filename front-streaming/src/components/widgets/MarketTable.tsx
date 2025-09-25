import React from "react";
import type { TickerNumeric } from "../../lib/binanceTypes";
import { fmtNum, fmtPct, fmtTime } from "../../lib/format";
import { useControls } from "../../store/controlsStore";
import "./widgets.css";

type Props = { rows: TickerNumeric[] };

export default function MarketTable({ rows }: Props) {
  const { setSelectedSymbol } = useControls();

  return (
    <div className="table-wrap">
      <table className="ticker-table">
        <thead>
          <tr>
            <th>Event type</th>
            <th>Event time</th>
            <th>Symbol</th>
            <th>Last price</th>
            <th>Price change (Δ)</th>
            <th>Price change (%)</th>
            <th>Weighted average price (24h)</th>
            <th>Open price (24h)</th>
            <th>High price (24h)</th>
            <th>Low price (24h)</th>
            <th>Total traded base asset volume (24h)</th>
            <th>Total traded quote asset volume (24h)</th>
            <th>Total number of trades (24h)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol}>
              <td>{r.eventType}</td>
              <td>{fmtTime(r.eventTime)}</td>
              <td>
                <button className="link-symbol" onClick={() => setSelectedSymbol(r.symbol)}>
                  {r.symbol}
                </button>
              </td>
              <td className="num">{fmtNum(r.lastPrice)}</td>
              <td className="num">{fmtNum(r.priceChange)}</td>
              <td className={`num ${r.priceChangePercent >= 0 ? "up" : "down"}`}>{fmtPct(r.priceChangePercent)}</td>
              <td className="num">{fmtNum(r.weightedAvgPrice)}</td>
              <td className="num">{fmtNum(r.openPrice)}</td>
              <td className="num">{fmtNum(r.highPrice)}</td>
              <td className="num">{fmtNum(r.lowPrice)}</td>
              <td className="num">{fmtNum(r.baseVolume24h)}</td>
              <td className="num">{fmtNum(r.quoteVolume24h)}</td>
              <td className="num">{fmtNum(r.tradeCount24h, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
