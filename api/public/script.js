// !!! RECOMMENDED WINDOW SIZE: 700x600 !!!
const MIN_TTS_AMOUNT = 100; // Set this to the minimum donation amount you want for TTS to appear.
const DONATION_TIME = 7000; // Set this to the time you want the donation to appear on the screen.
const SOUND_VOLUME = 0.2; // Set this to the volume you want the donation sound to be.

let lastDonationTimestamp = 0;
let isDisplayingDonation = false;

let msg = new SpeechSynthesisUtterance();

speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  msg.voice = voices[5];
};

async function fetchDonations() {
  if (isDisplayingDonation) return;

  const response = await fetch("/api/donations");
  const donations = await response.json();

  const newDonation = donations.find(
    (donation) =>
      new Date(donation.timestamp) > new Date(lastDonationTimestamp),
  );

  if (newDonation) {
    isDisplayingDonation = true;
    lastDonationTimestamp = newDonation.timestamp;

    const donationsDiv = document.getElementById("donations");

    const donationAmount = Number(newDonation.amount); // Convert
    if (donationAmount < MIN_TTS_AMOUNT) {
      donationsDiv.innerHTML = /*html*/ `
              <div class="alert_widget-container">
                <div class="alert_image-container">
                  <img id="main-image" class="alert_image" src="/dono.gif" alt="Alert image" />
                </div>
                <div class="alert_text-container">
                  <div class="resize-detector">&nbsp;</div>
                  <div style="width: 100%;">
                    <p class="alert_text">
                      <span class="alert-widget__text-accent">${sanitizeHTML(
                        newDonation.donorName,
                      )}</span> donated <strong>${
                        newDonation.amount
                      }</strong> ROBUX!</p>
                    <p class="alert_secondary-text">${sanitizeHTML(
                      newDonation.donorMessage,
                    )}</p>
                  </div>
                </div>
              </div>
            `;
      showDonation(
        sanitizeHTML(newDonation.donorName),
        newDonation.amount,
        sanitizeHTML(newDonation.donorMessage),
      );
    } else {
      donationsDiv.innerHTML = /*html*/ `
              <div class="alert_widget-container">
                <div class="alert_image-container">
                  <img id="main-image" class="alert_image" src="/dono.gif" alt="Alert image" />
                </div>
                <div class="alert_text-container">
                  <div class="resize-detector">&nbsp;</div>
                  <div style="width: 100%;">
                    <p class="alert_text">
                      <span class="alert-widget__text-accent">${sanitizeHTML(
                        newDonation.donorName,
                      )}</span> donated <strong>${
                        newDonation.amount
                      }</strong> ROBUX!</p>
                    <p class="alert_secondary-text">${sanitizeHTML(
                      newDonation.donorMessage,
                    )}</p>
                  </div>
                </div>
              </div>
            `;
      showDonation(
        sanitizeHTML(newDonation.donorName),
        newDonation.amount,
        sanitizeHTML(newDonation.donorMessage),
      );
    }

    setTimeout(() => {
      hideDonation();
    }, DONATION_TIME); // Display each donation for 7 seconds
  }
}

function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

function showDonation(donorName, amount, donorMessage) {
  const donationsDiv = document.getElementById("donations");
  donationsDiv.classList.remove("fadeOut");
  donationsDiv.classList.add("fadeIn");
  donationsDiv.style.display = "flex"; // Make sure the div is visible

  // Adjust the volume of the donation sound
  const donationSound = document.getElementById("donationSound");
  donationSound.volume = SOUND_VOLUME; // Adjust volume to 20%

  // Play the donation sound
  donationSound.play();

  // When the donation sound ends, play the TTS message after a 1-second delay
  donationSound.onended = () => {
    setTimeout(() => {
      const donationAmount = Number(amount); // Convert amount to a number
      if (donationAmount < MIN_TTS_AMOUNT) {
        console.log(`Donation below threshold (${donationAmount} ROBUX)`);
      } else {
        console.log(
          `Donation above threshold, playing TTS: ${donorName} donated ${donationAmount} ROBUX: ${donorMessage}`,
        );
        const ttsMessage = `${donorName} donated ${donationAmount} ROBUX: ${donorMessage}`;
        msg.text = ttsMessage;
        window.speechSynthesis.speak(msg);
      }
    }, 100);
  };
}

function hideDonation() {
  const donationsDiv = document.getElementById("donations");
  donationsDiv.classList.remove("fadeIn");
  donationsDiv.classList.add("fadeOut");
  setTimeout(() => {
    donationsDiv.style.display = "none"; // Hide the div after the animation
    isDisplayingDonation = false; // Reset the flag
  }, 1000); // This duration should match the length of the fadeOut animation
}

// Example: Start fetching donations
setInterval(fetchDonations, 1000); // Check for new donations every 1 second
