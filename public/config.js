// Overlay settings. Server settings (secret, port...) live in .env.
// This file is public: never put secrets in it.
export const CONFIG = {
  minTtsAmount: 100, // Minimum Robux amount for TTS to be triggered
  donationTime: 7000, // Time (ms) to display each donation
  fadeTime: 1000, // Time (ms) for the donation to fade out
  soundVolume: 0.2, // Volume of the sound effect (0.0 - 1.0)
  ttsVoiceName: "", // Name of the TTS voice to use (leave empty for default)
  pollInterval: 1000, // Time (ms) between each poll of the server
};
