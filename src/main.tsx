import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initAudioResume } from "@/lib/audio";
import "./globals.css";

// Safari iOS: AudioContext needs a user gesture — prepare resume handler
initAudioResume();

createRoot(document.getElementById("root")!).render(<App />);