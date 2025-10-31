import React, { useEffect } from "react";

export default function VoiceDetector({ onHelp }) {
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("🎙 Heard:", transcript);
      if (transcript.includes("help") || transcript.includes("emergency") || transcript.includes("save me")) {
        onHelp();
      }
    };

    recognition.onerror = (e) => console.error("Speech recognition error:", e);
    recognition.start();
    return () => recognition.stop();
  }, [onHelp]);

  return (
    <div className="voice-detector">
      <p>🎙 Voice detection active (say “Help”)</p>
    </div>
  );
}
