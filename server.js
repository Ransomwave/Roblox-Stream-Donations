const CLIENT_SECRET = "roblox"; // Replace with your own client secret
const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

let donations = []; // Temporary storage for donations

app.post("/api/donations", (req, res) => {
  const { donorName, amount, donorMessage, clientSecret } = req.body; // Extract clientSecret from the request body

  // Validate the client secret
  if (clientSecret !== CLIENT_SECRET) {
    return res.status(401).send("Unauthorized: Invalid client secret"); // Return 418 status code if the client secret is nil or invalid
  }

  // Process the donation
  donations.push({ donorName, amount, donorMessage, timestamp: new Date() }); // Add timestamp for sorting
  res.status(200).send("Donation received");

  // Remove the first donation from the temporary storage after processing
  // Optionally, you can remove old donations based on some condition, e.g., keeping only the last 10 donations
  if (donations.length >= 2) {
    donations.shift();
  }
});

app.get("/api/donations", (req, res) => {
  res.json(donations);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(3000, () => console.log("Server running on port 3000"));
