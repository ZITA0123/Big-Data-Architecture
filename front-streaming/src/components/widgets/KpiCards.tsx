import React from "react";
import { fmtNum, fmtPct } from "../../lib/format";
import type { DerivedMetrics } from "../../hooks/useBinanceAllTickers";
import "./widgets.css";
type Props = { metrics: DerivedMetrics };
export default function KpiCards({ metrics }: Props){
  return (<div className="kpis">
    <div className="kpi"><div className="kpi-title">Max Last price</div><div className="kpi-value">{fmtNum(metrics.maxLastPrice)}</div></div>
    <div className="kpi"><div className="kpi-title">Min Last price</div><div className="kpi-value">{fmtNum(metrics.minLastPrice)}</div></div>
    <div className="kpi"><div className="kpi-title">Breadth market (↑)</div><div className="kpi-value">{fmtPct(metrics.breadthUpPct,1)}</div></div>
    <div className="kpi"><div className="kpi-title">Trade Count total (24h)</div><div className="kpi-value">{fmtNum(metrics.totalTrades24h,0)}</div></div>
    <div className="kpi"><div className="kpi-title">Trade rate (/sec)</div><div className="kpi-value">{fmtNum(metrics.tradeRatePerSec,2)}</div></div>
  </div>);
}
