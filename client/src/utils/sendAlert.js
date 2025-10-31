// client/src/utils/sendAlert.js
export async function sendAlert({ username, hr, spo2, reason, location, contacts }) {
  try {
    // backend proxy via package.json proxy -> http://localhost:5000
    const resp = await fetch("/api/send-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, hr, spo2, reason, location, contacts })
    });
    const data = await resp.json();
    return { ok: resp.ok, data };
  } catch (err) {
    console.error("sendAlert error:", err);
    return { ok: false, error: err.message };
  }
}
