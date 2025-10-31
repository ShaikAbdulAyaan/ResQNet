// client/src/App.js
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import "./styles.css";

export default function App() {
  const [screen, setScreen] = useState("splash");

  useEffect(() => {
    const timer = setTimeout(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) setScreen("dashboard");
        else setScreen("login");
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (screen === "splash") return <SplashScreen onFinish={() => setScreen("login")} />;
  if (screen === "login")
    return <LoginPage onLogin={() => setScreen("dashboard")} goToSignup={() => setScreen("signup")} />;
  if (screen === "signup")
    return <SignupPage onSignup={() => setScreen("dashboard")} goToLogin={() => setScreen("login")} />;
  if (screen === "dashboard") return <Dashboard />;
  return null;
}


