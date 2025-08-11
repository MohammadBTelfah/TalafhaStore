// src/component/OrderLoop.jsx
import React from "react";
import "../styles/AboutUs.css";

export default function OrderLoop({
  duration = "9s",
  debug = true,
  boxesFrom = "right" // "right" | "left"
}) {
  return (
    <div
      className={`au-order-scene ${boxesFrom === "right" ? "flow-rtl" : ""}`}
      style={{ "--T": duration }}
    >
      <div className="au-belt">
        <div className="au-rollers">{Array.from({ length: 18 }).map((_, i) => <span key={i} />)}</div>
      </div>

      <div className="au-box b1"><span className="tape" /></div>
      <div className="au-box b2"><span className="tape" /></div>

      <div className={`au-truck face-right${debug ? " debug" : ""}`}>
        <div className="cab"><div className="glass" /><div className="grill" /></div>
        <div className="trailer"><div className="slot s1" /><div className="slot s2" /></div>
        <div className="wheels"><div className="wheel w-front" /><div className="wheel" /></div>
        <div className="shadow" />
      </div>
    </div>
  );
}
