import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  SingleValueData,
  Time,
  ColorType,
  PriceScaleMode,
} from "lightweight-charts";
import type { LinePoint } from "../../hooks/useBinanceAllTickers";
import "./widgets.css";

type Props = {
  symbol: string;
  series: LinePoint[]; // time (seconds epoch), value = Price change (%)
};

function fmtPct(n: number, digits = 2) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)}%`;
}
function fmtTime(sec: number) {
  return new Date(sec * 1000).toLocaleTimeString();
}

export default function SymbolLine({ symbol, series }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Valeur au survol (crosshair)
  const [legend, setLegend] = useState<{ value: number | null; time: number | null }>({
    value: null,
    time: null,
  });

  // (re)création du chart quand le symbole change
  useEffect(() => {
    if (!containerRef.current) return;

    // reset si déjà créé
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      lineRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      height: 300,
      width: containerRef.current.clientWidth,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#e2e8f0" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      rightPriceScale: { borderColor: "#1f2937", mode: PriceScaleMode.Normal },
      timeScale: { borderColor: "#1f2937" },
      crosshair: { mode: 0 }, // Normal
    });

    const line = chart.addLineSeries({
      lineWidth: 2,
      // ✅ Fix TS: format custom DOIT préciser minMove
      priceFormat: { type: "custom", minMove: 0.0001, formatter: (v: number) => fmtPct(v) },
    });

    chartRef.current = chart;
    lineRef.current = line;

    // Légende au survol — lit la valeur EXACTE du point sous le crosshair
    chart.subscribeCrosshairMove((param) => {
      if (!lineRef.current) return;
      if (!param.time) {
        setLegend({ value: null, time: null });
        return;
      }
      const raw = param.seriesData.get(lineRef.current);
      const d = raw as SingleValueData | undefined;
      if (d && typeof d.value === "number") {
        // d.time est Time (UTCTimestamp) -> cast en number (secondes)
        setLegend({ value: d.value, time: d.time as number });
      } else {
        setLegend({ value: null, time: null });
      }
    });

    // resize
    const onResize = () => chart.applyOptions({ width: containerRef.current!.clientWidth });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [symbol]);

  // Alimente la série à chaque changement de données
  useEffect(() => {
    if (!lineRef.current) return;
    const data: SingleValueData[] = series.map((p) => ({
      time: p.time as Time, // secondes epoch
      value: p.value, // Price change (%)
    }));
    lineRef.current.setData(data);
    // optionnel : always fit full content
    chartRef.current?.timeScale().fitContent();
  }, [series]);

  return (
    <div className="chart-card">
      <div className="chart-title">
        {symbol} — <span style={{ color: "#93c5fd" }}>Price change (%)</span>
        <span style={{ marginLeft: 12, color: "#94a3b8", fontSize: 12 }}>
          {legend.time !== null && legend.value !== null
            ? `${fmtTime(legend.time)} • ${fmtPct(legend.value)}`
            : ""}
        </span>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
