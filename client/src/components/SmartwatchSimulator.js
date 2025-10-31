import React, { useState, useEffect } from "react";

export default function SmartwatchSimulator() {
  const [hr, setHr] = useState(80);
  const [spo2, setSpo2] = useState(98);

  useEffect(() => {
    const interval = setInterval(() => {
      setHr(Math.floor(70 + Math.random() * 20));
      setSpo2(Math.floor(95 + Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="watch-sim">
      <h3>⌚ Smartwatch Connected</h3>
      <p>❤️ Heart Rate: {hr} bpm</p>
      <p>🩸 SpO₂: {spo2}%</p>
    </div>
  );
}
