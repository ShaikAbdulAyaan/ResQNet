// testTwilio.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

client.messages
  .create({
    body: "🔔 Test message from ResQ server!",
    from: process.env.TWILIO_PHONE, // your Twilio phone number
    to: "+91XXXXXXXXXX", // replace with your verified number
  })
  .then(msg => console.log("✅ Sent successfully:", msg.sid))
  .catch(err => console.error("❌ Error:", err));
