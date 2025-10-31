// client/src/utils/api.js

const BASE_URL = "https://resqnet-3p6z.onrender.com/api/send-alert";

// 🚨 Send emergency alert
export const sendAlert = async (phone) => {
  try {
    const res = await fetch(`${BASE_URL}/send-alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error sending alert:", err);
    return { success: false, error: err.message };
  }
};
