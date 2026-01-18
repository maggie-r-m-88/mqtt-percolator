import React from "react";
import styles from "./Thermometer.module.scss";

type ThermometerProps = {
  valueC: number;
  min?: number;
  max?: number;
  height?: number;
  hotThreshold?: number; // temp at which mercury turns red
};

export default function Thermometer({
  valueC,
  min = 0,
  max = 100,
  height = 250,
  hotThreshold = 45,
}: ThermometerProps) {
  const clamped = Math.max(min, Math.min(max, valueC));
  const percent = ((clamped - min) / (max - min)) * 100;

  // Fahrenheit
  const valueF = (clamped * 9) / 5 + 32;

  // Mercury color logic
  const mercuryColor =
    clamped >= hotThreshold ? "#f44336" : clamped >= 25 ? "#8bc34a" : "#2196f3";

  return (
    <div className={styles.centered} style={{ height: `${height}px` }}>
      <div className={styles["tg-thermometer"]} style={{ height: `${height}px` }}>
        <div className={styles.meter}>
          <div className={styles["mask"]}>
            <div
              className={styles.mercury}
              style={{ height: `${percent}%`, backgroundColor: mercuryColor }}
            ></div>
          </div>

          {/* Bulb at the bottom */}
          <div
            className={styles.bulb}
            style={{ backgroundColor: mercuryColor }}
          ></div>

          {/* Labels */}
          <div className={styles.labels}>
            {[100, 75, 50, 25, 0].map((p, i) => {
              const f = Math.round((p * 9) / 5 + 32);
              return (
                <div key={i} className={styles.tick} style={{ bottom: `${p}%` }}>
                  <span className={styles.fahrenheit}>{f}°F</span>
                  <span className={styles.celsius}>{p}°C</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
