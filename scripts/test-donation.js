// Sends a fake donation to the server, using CLIENT_SECRET from .env.
// Usage: npm run test-donation -- [amount] [url]
// e.g.   npm run test-donation -- 500 https://your-amazing-website.vercel.app
const amount = Number(process.argv[2] ?? 150);
const message = process.argv[3] ?? "This is a test donation!";
const url = process.argv[4] ?? `http://localhost:${process.env.PORT || 3000}`;

const response = await fetch(`${url}/api/donations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    donorName: "Test Donor",
    amount,
    donorMessage: message,
    clientSecret: process.env.CLIENT_SECRET,
  }),
});

console.log(`${response.status}: ${await response.text()}`);
