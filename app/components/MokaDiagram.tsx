"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

export default function RealisticMokaPot() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 120;
    const height = 200;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // --------------------------
    // Draw base (water chamber)
    // --------------------------
    svg
      .append("ellipse")
      .attr("cx", width / 2)
      .attr("cy", 160)
      .attr("rx", 30)
      .attr("ry", 15)
      .attr("fill", "#cfcfcf")
      .attr("stroke", "#555")
      .attr("stroke-width", 2);

    svg
      .append("rect")
      .attr("x", width / 2 - 30)
      .attr("y", 100)
      .attr("width", 60)
      .attr("height", 60)
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    // --------------------------
    // Draw middle (coffee chamber / funnel)
    // --------------------------
    const funnelPath = d3.path();
    funnelPath.moveTo(width / 2 - 25, 100);
    funnelPath.lineTo(width / 2 + 25, 100);
    funnelPath.lineTo(width / 2 + 15, 40);
    funnelPath.lineTo(width / 2 - 15, 40);
    funnelPath.closePath();

    svg
      .append("path")
      .attr("d", funnelPath.toString())
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 2);

    // --------------------------
    // Draw top lid
    // --------------------------
    svg
      .append("rect")
      .attr("x", width / 2 - 15)
      .attr("y", 20)
      .attr("width", 30)
      .attr("height", 20)
      .attr("fill", "#eee")
      .attr("stroke", "#555")
      .attr("stroke-width", 2)
      .attr("rx", 4);

    // --------------------------
    // Draw spout
    // --------------------------
    const spoutPath = d3.path();
    spoutPath.moveTo(width / 2 + 15, 40);
    spoutPath.lineTo(width / 2 + 30, 35);
    spoutPath.lineTo(width / 2 + 30, 25);
    spoutPath.lineTo(width / 2 + 15, 20);

    svg
      .append("path")
      .attr("d", spoutPath.toString())
      .attr("fill", "#eee")
      .attr("stroke", "#555")
      .attr("stroke-width", 2);
  }, []);

  return <svg ref={svgRef} width={140} height={220} className="mx-auto mt-4" />;
}
