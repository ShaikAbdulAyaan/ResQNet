// server/testTwilio.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
  console.error("❌ Missing Twilio credentials in .env");
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

client.messages
  .create({
    body: "🔔 Test message from ResQNet server!",
    from: TWILIO_PHONE,
    to: "+91XXXXXXXXXX", // replace with your verified number
  })
  .then(msg => console.log("✅ Sent successfully:", msg.sid))
  .catch(err => console.error("❌ Error:", err.message));
