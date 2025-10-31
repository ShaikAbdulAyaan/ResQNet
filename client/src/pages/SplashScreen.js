import React, { useEffect } from "react";
import logo from "../logo.png";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash">
      <img src={logo} alt="ResQNet" className="splash-logo" />
      <h1>ResQNet</h1>
    </div>
  );
}
