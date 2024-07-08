const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static("public"));

let donations = []; // Temporary storage for donations

app.post("/api/donations", (req, res) => {
  const { donorName, amount } = req.body;
  donations.push({ donorName, amount, timestamp: new Date() }); // Add timestamp for sorting
  res.status(200).send("Donation received");
});

app.get("/api/donations", (req, res) => {
  res.json(donations);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(3000, () => console.log("Server running on port 3000"));
