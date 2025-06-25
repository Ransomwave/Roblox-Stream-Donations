const CLIENT_SECRET = process.env.CLIENT_SECRET; // Replace with your own client secret

// To validate our client's secret, we need to use a variable inside the .env file
// Make sure to create a .env file at the root (inside the folder) of the project with the CLIENT_SECRET
if (!CLIENT_SECRET) {
  console.error(
    `Error: CLIENT_SECRET is not set. Please set the CLIENT_SECRET environment variable inside a ".env" at the root of the project.`
  );
  process.exit(1); // Exit the process if CLIENT_SECRET is not set
}

const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

let donations = []; // Temporary storage for donations

// Endpoint to handle donation submissions
app.post("/api/donations", (req, res) => {
  const { donorName, amount, donorMessage, clientSecret } = req.body; // Extract clientSecret from the request body

  // Validate the client secret
  if (clientSecret !== CLIENT_SECRET) {
    return res.status(401).send("Unauthorized: Invalid client secret"); // Return 401 status code if the client secret is nil or invalid
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

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(3000, () => console.log("Server running on port 3000"));
