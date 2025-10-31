import React from "react";
import "./EmergencyButton.css";

export default function EmergencyButton({ onClick }) {
  return (
    <button className="emergency-btn" onClick={onClick}>
      🚨 Trigger Emergency
    </button>
  );
}
