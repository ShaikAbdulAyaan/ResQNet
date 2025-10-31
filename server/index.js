// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// -------------------- Load Environment --------------------
dotenv.config();
console.log("✅ Loaded TWILIO SID:", process.env.TWILIO_ACCOUNT_SID);

// -------------------- Setup App --------------------
const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "https://resqnet-3p6z.onrender.com/api/send-alert",
      "https://resqnet-3p6z.onrender.com/api/send-alert", // allow your frontend URL
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// -------------------- Helper Paths --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_BUILD_PATH = path.join(__dirname, "../client/build");

// -------------------- Twilio Setup --------------------
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH) {
  try {
    twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);
    console.log("✅ Twilio client initialized successfully.");
  } catch (err) {
    console.error("❌ Error initializing Twilio:", err.message);
  }
} else {
  console.warn("⚠️ Twilio credentials missing — SMS sending will be simulated.");
}

// -------------------- API Routes --------------------

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "🚑 ResQNet backend is healthy!" });
});

// Emergency alert route
app.post("/api/send-alert", async (req, res) => {
  try {
    const {
      user = "Unknown User",
      hr = "N/A",
      spo2 = "N/A",
      location = {},
      reason = "Distress detected",
      contacts = [],
    } = req.body;

    console.log("📨 Incoming emergency alert from frontend:", req.body);

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No contacts provided" });
    }

    const lat = location?.lat ?? null;
    const lon = location?.lon ?? location?.lng ?? null;
    const mapUrl =
      lat && lon ? `https://maps.google.com/?q=${lat},${lon}` : "Location unavailable";

    const smsText = `🚨 EMERGENCY ALERT 🚨
User: ${user}
Reason: ${reason}
Heart Rate: ${hr}
SpO₂: ${spo2}
Location: ${mapUrl}`;

    const results = [];

    for (const phone of contacts) {
      try {
        if (twilioClient && TWILIO_PHONE) {
          const message = await twilioClient.messages.create({
            body: smsText,
            from: TWILIO_PHONE,
            to: phone.startsWith("+") ? phone : `+91${phone}`,
          });
          console.log(`✅ SMS sent to ${phone}: ${message.sid}`);
          results.push({ to: phone, sid: message.sid });
        } else {
          console.log("📱 Simulated SMS to:", phone);
          results.push({ to: phone, simulated: true });
        }
      } catch (err) {
        console.error(`❌ Failed to send SMS to ${phone}:`, err.message);
        results.push({ to: phone, error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("❌ Error in /api/send-alert:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------- Serve React Frontend --------------------
app.use(express.static(CLIENT_BUILD_PATH));

// Serve React for all routes (important for PWA and deployment)
app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, "index.html"));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

