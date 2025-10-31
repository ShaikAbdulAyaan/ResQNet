import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🚑 ResQNet backend is running successfully!");
});

app.post("/send-alert", async (req, res) => {
  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: "🚨 Emergency alert from ResQNet!",
      from: process.env.TWILIO_PHONE,
      to: req.body.phone,
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
