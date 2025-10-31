import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./Dashboard.css";

export default function Dashboard() {
  const [user] = useState(auth.currentUser);
  const [username, setUsername] = useState("");
  const [heartRate, setHeartRate] = useState(86);
  const [spo2, setSpo2] = useState(97);
  const [watchConnected, setWatchConnected] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState("");
  const [location, setLocation] = useState(null);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const deferredPrompt = useRef(null);
  const recognitionRef = useRef(null);
  const restartingRef = useRef(false);

  // 🧍 Username setup
  useEffect(() => {
    if (user?.email) {
      const key = "resq_username_" + user.email;
      const saved = localStorage.getItem(key);
      if (saved) setUsername(saved);
      else {
        const nm = user.email.split("@")[0];
        setUsername(nm);
        localStorage.setItem(key, nm);
      }
    }
  }, [user]);

  // ⌚ Simulated smartwatch data
  useEffect(() => {
    const id = setInterval(() => {
      const connected = Math.random() > 0.2;
      setWatchConnected(connected);
      if (connected) {
        const hr = Math.floor(80 + Math.random() * 10);
        const sp = Math.floor(96 + Math.random() * 3);
        setHeartRate(hr);
        setSpo2(sp);
        if (hr < 45 || sp < 85) handleEmergency("Abnormal vitals detected");
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ☎️ Contacts persistence
  useEffect(() => {
    const key = "resq_contacts_" + (user?.email ?? "anon");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    const key = "resq_contacts_" + (user?.email ?? "anon");
    localStorage.setItem(key, JSON.stringify(contacts));
  }, [contacts, user]);

  // 📍 Location fetching
  const getLocation = async () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("No geolocation support"));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setLocation(loc);
          resolve(loc);
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  useEffect(() => {
    const update = () => getLocation().catch(() => {});
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  // ➕ Add & remove contacts
  const addContact = () => {
    const num = newContact.trim();
    if (!num) return alert("Enter a phone number.");
    if (contacts.includes(num)) return alert("Number already exists.");
    setContacts((c) => [...c, num]);
    setNewContact("");
  };
  const removeContact = (i) =>
    setContacts((c) => c.filter((_, idx) => idx !== i));

  // 🚨 Emergency alert
  const handleEmergency = async (reason = "Manual trigger") => {
    if (!contacts.length) {
      alert("Please add at least one emergency contact first.");
      return;
    }
    try {
      setSending(true);
      const s = new Audio("/siren.mp3");
      s.play().catch(() => {});
      alert("🚨 Emergency triggered — fetching location...");
      const loc = await getLocation().catch(() => null);
      const payload = {
        user: username || user?.email || "Unknown",
        hr: heartRate,
        spo2,
        location: loc,
        reason,
        contacts,
      };
      // ✅ Use live backend URL
      const res = await fetch("https://resqnet-3p6z.onrender.com/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) alert("✅ SMS alerts sent!");
      else alert("❌ Failed to send SMS: " + (data.error || "Unknown error"));
    } catch (e) {
      console.error(e);
      alert("⚠️ Emergency sending failed. Check backend/server.");
    } finally {
      setSending(false);
    }
  };

  // 🎤 Voice command trigger
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-IN";

    rec.onstart = () => {
      setListening(true);
      restartingRef.current = false;
    };
    rec.onend = () => {
      setListening(false);
      if (!restartingRef.current) {
        restartingRef.current = true;
        setTimeout(() => tryStart(), 1000);
      }
    };
    rec.onerror = (e) => console.warn("Speech error:", e);

    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript.toLowerCase().trim();
      console.log("Heard:", text);
      if (text.includes("help") || text.includes("emergency")) {
        handleEmergency("Voice command detected");
      }
    };

    recognitionRef.current = rec;

    const tryStart = () => {
      if (!recognitionRef.current) return;
      try {
        recognitionRef.current.start();
      } catch (e) {
        if (e.name === "InvalidStateError") return;
        console.warn("Recognition start failed:", e);
      }
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => tryStart())
      .catch(() => alert("Microphone permission denied."));

    return () => {
      rec.stop();
    };
  }, [contacts]);

  // 📲 Install prompt for PWA
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const choice = await deferredPrompt.current.userChoice;
      if (choice.outcome === "accepted") alert("📲 App installed!");
      deferredPrompt.current = null;
    } else alert("App already installed or not supported.");
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {username}</h2>
      <p style={{ opacity: 0.8 }}>{user?.email}</p>

      <div style={{ marginBottom: 8 }}>
        {listening ? (
          <span style={{ color: "limegreen" }}>
            🎤 Voice help active — say “help” or “emergency”
          </span>
        ) : (
          <span style={{ color: "orange" }}>
            🎤 Initializing voice help (allow mic)
          </span>
        )}
      </div>

      <div className={`device-status ${watchConnected ? "connected" : ""}`}>
        <h3>
          ⌚ {watchConnected ? "Smartwatch Connected" : "Smartwatch Disconnected"}
        </h3>
        {watchConnected && (
          <>
            <p>💓 Heart Rate: {heartRate} bpm</p>
            <p>🩸 SpO₂: {spo2}%</p>
          </>
        )}
      </div>

      <div className="location">
        <h4>📍 Current Location</h4>
        {location ? (
          <p>
            Lat: {location.lat.toFixed(5)}, Lon: {location.lon.toFixed(5)} <br />
            Accuracy: ±{Math.round(location.accuracy)}m
          </p>
        ) : (
          <p>Fetching location...</p>
        )}
      </div>

      <div className="contacts">
        <h4>📞 Emergency Contacts</h4>
        <div className="contact-input">
          <input
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            placeholder="Enter phone number"
          />
          <button onClick={addContact}>Add</button>
        </div>
        <ul>
          {contacts.map((c, i) => (
            <li key={i}>
              {c}
              <button onClick={() => removeContact(i)}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="emergency-btn"
        onClick={() => handleEmergency()}
        disabled={sending}
      >
        {sending ? "Sending..." : "🚨 Trigger Emergency"}
      </button>

      <button className="install-btn" onClick={handleInstallClick}>
        📲 Download / Install App
      </button>

      <button className="logout-btn" onClick={() => signOut(auth)}>
        Logout
      </button>
    </div>
  );
}


