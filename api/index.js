import express from "express";
import path from "node:path";

const CLIENT_SECRET = process.env.CLIENT_SECRET; // Replace with your own client secret

// To validate our client's secret, we need to use a variable inside the .env file
// Make sure to create a .env file at the root (inside the folder) of the project with the CLIENT_SECRET
if (!CLIENT_SECRET) {
  console.error(
    `Error: CLIENT_SECRET is not set. Please set the CLIENT_SECRET environment variable inside a ".env" at the root of the project.`,
  );
  process.exit(1); // Exit the process if CLIENT_SECRET is not set
}

// Server settings, documented in .env.example
const MAX_STORED_DONATIONS = Number(process.env.MAX_STORED_DONATIONS) || 50;
const MAX_TEXT_LENGTH = Number(process.env.MAX_TEXT_LENGTH) || 200;

const app = express();
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(import.meta.dirname, "public")));

let donations = [];
let lastId = 0;

// Endpoint to handle donation submissions
app.post("/api/donations", (req, res) => {
  const { donorName, amount, donorMessage, clientSecret } = req.body ?? {};

  // Validate the client secret
  if (clientSecret !== CLIENT_SECRET) {
    return res.status(401).send("Unauthorized: Invalid client secret");
  }

  const numericAmount = Number(amount);
  if (
    typeof donorName !== "string" ||
    !Number.isFinite(numericAmount) ||
    (donorMessage != null && typeof donorMessage !== "string")
  ) {
    return res.status(400).send("Bad request: invalid donation data");
  }

  // store the donation, ensuring we don't exceed the max number of stored donations
  lastId = Math.max(Date.now(), lastId + 1);
  donations.push({
    id: lastId,
    donorName: donorName.slice(0, MAX_TEXT_LENGTH),
    amount: numericAmount,
    donorMessage: (donorMessage ?? "").slice(0, MAX_TEXT_LENGTH),
  });
  donations = donations.slice(-MAX_STORED_DONATIONS);

  res.status(200).send("Donation received");
});

// Returns stored donations, oldest first
app.get("/api/donations", (_req, res) => {
  res.json(donations);
});

// Serve the main HTML file
app.get("/", (_req, res) => {
  res.sendFile(path.join(import.meta.dirname, "views", "index.html"));
});

// Start the server if this file is run directly
if (process.argv[1] === import.meta.filename) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
