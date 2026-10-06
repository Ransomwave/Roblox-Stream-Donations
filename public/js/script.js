// !!! RECOMMENDED WINDOW SIZE: 700x600 !!!
// !!! SETTINGS ARE DEFINED IN public/config.json !!!

let config;
let lastSeenId = null; // Id of the newest donation already shown; null until the first fetch
const msg = new SpeechSynthesisUtterance();

/** Picks the configured TTS voice, falling back to the first English voice. */
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  msg.voice =
    voices.find((voice) => voice.name === config?.ttsVoiceName) ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    null;
}

speechSynthesis.onvoiceschanged = pickVoice;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Polls the server and shows unseen donations one at a time, oldest first. */
async function pollDonations() {
  try {
    const response = await fetch("/api/donations");
    const donations = await response.json();

    if (lastSeenId === null) {
      // Skip donations that arrived before the overlay was opened
      lastSeenId = donations.at(-1)?.id ?? 0;
    } else {
      const newDonation = donations.find(
        (donation) => donation.id > lastSeenId,
      );
      if (newDonation) {
        lastSeenId = newDonation.id;
        await displayDonation(newDonation);
      }
    }
  } catch (error) {
    console.error("Failed to fetch donations:", error);
  }

  setTimeout(pollDonations, config.pollInterval);
}

function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

/** Shows a donation alert, plays its sound and TTS, then hides it. Resolves once it's hidden. */
async function displayDonation({ donorName, amount, donorMessage }) {
  const donationsDiv = document.getElementById("donations");
  donationsDiv.innerHTML = /*html*/ `
    <div class="alert_widget-container">
      <div class="alert_image-container">
        <img id="main-image" class="alert_image" src="/media/dono.gif" alt="Alert image" />
      </div>
      <div class="alert_text-container">
        <div class="resize-detector">&nbsp;</div>
        <div style="width: 100%;">
          <p class="alert_text">
            <span class="alert-widget__text-accent">${sanitizeHTML(donorName)}</span>
            donated <strong>${Number(amount)}</strong> ROBUX!
          </p>
          <p class="alert_secondary-text">${sanitizeHTML(donorMessage)}</p>
        </div>
      </div>
    </div>
  `;

  donationsDiv.classList.remove("fadeOut");
  donationsDiv.classList.add("fadeIn");
  donationsDiv.style.display = "flex"; // Make sure the div is visible

  const donationSound = document.getElementById("donationSound");
  donationSound.volume = config.soundVolume;

  // When the donation sound ends, read the donation out loud if it meets the TTS threshold
  donationSound.onended = () => {
    setTimeout(() => {
      if (amount < config.minTtsAmount) {
        console.log(`Donation below threshold (${amount} ROBUX)`);
        return;
      }
      msg.text = `${donorName} donated ${amount} ROBUX: ${donorMessage}`;
      console.log(`Donation above threshold, playing TTS: ${msg.text}`);
      speechSynthesis.speak(msg);
    }, 100);
  };
  donationSound
    .play()
    .catch((error) => console.error("Failed to play donation sound:", error));

  await wait(config.donationTime);

  donationsDiv.classList.remove("fadeIn");
  donationsDiv.classList.add("fadeOut");
  await wait(config.fadeTime);
  donationsDiv.style.display = "none"; // Hide the div after the animation
}

/** Loads config.json, then starts polling. */
async function start() {
  config = await (await fetch("/config.json")).json();
  pickVoice();
  pollDonations();
}

start();
