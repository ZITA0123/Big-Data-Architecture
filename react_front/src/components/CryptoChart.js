import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as fc from "d3fc";

const CryptoChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    // Préparer les données pour le graphique
    const formattedData = data.map((d) => ({
      date: new Date(d.open_time),
      open: d.open_price,
      high: d.high_price,
      low: d.low_price,
      close: d.close_price,
    }));

    // Dimensions du graphique
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    // Supprimer tout graphique existant dans le conteneur
    d3.select(chartRef.current).selectAll("*").remove();

    // Créer les échelles
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(formattedData, (d) => d.low), d3.max(formattedData, (d) => d.high)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Créer le graphique en bougies
    const candlestick = fc
      .seriesCanvasCandlestick()
      .xScale(xScale)
      .yScale(yScale)
      .crossValue((d) => d.date)
      .openValue((d) => d.open)
      .highValue((d) => d.high)
      .lowValue((d) => d.low)
      .closeValue((d) => d.close);

    // Ajouter le zoom et le panoramique
    const zoom = d3
      .zoom()
      .scaleExtent([1, 10]) // Limiter le zoom
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on("zoom", (event) => {
        const transform = event.transform;
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);

        // Redessiner le graphique avec les nouvelles échelles
        candlestick.xScale(newXScale).yScale(newYScale);
        ctx.clearRect(0, 0, width, height);
        candlestick.context(ctx)(formattedData);

        // Mettre à jour les axes
        xAxis.call(d3.axisBottom(newXScale));
        yAxis.call(d3.axisLeft(newYScale));
      });

    // Créer le conteneur SVG pour les axes
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Ajouter les axes
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Ajouter le conteneur pour le graphique
    const canvas = d3
      .select(chartRef.current)
      .append("canvas")
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .call(zoom)
      .node();

    const ctx = canvas.getContext("2d");

    // Dessiner le graphique
    ctx.clearRect(0, 0, width, height);
    candlestick.context(ctx)(formattedData);

    // Ajouter les repères et les info-bulles
    const tooltip = svg.append("text").attr("x", 10).attr("y", 10).style("font-size", "12px");

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const date = xScale.invert(mouseX);
        const closestData = formattedData.reduce((prev, curr) =>
          Math.abs(curr.date - date) < Math.abs(prev.date - date) ? curr : prev
        );

        tooltip.text(
          `Date: ${closestData.date.toLocaleString()}, Open: ${closestData.open}, High: ${closestData.high}, Low: ${closestData.low}, Close: ${closestData.close}`
        );
      })
      .on("mouseout", () => {
        tooltip.text("");
      });
  }, [data]);

  return (
    <div style={{ position: "relative", width: "800px", height: "400px" }} ref={chartRef}>
      {(!data || data.length === 0) && <p>Aucune donnée disponible pour le graphique.</p>}
    </div>
  );
};

export default CryptoChart;