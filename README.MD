# Robux Stream Donations - Web Source for OBS (TTS SUPPORT!)

A simple ExpressJS server that dynamically alerts of Roblox ROBUX donations donations to an OBS Web source, with support for **Donation messages, TTS, & more**! (Similar to Streamlabs alerts)

I personally use this tool [on my Twitch streams](https://www.twitch.tv/ransomwavelive), come check them out!

## Why?

Roblox streamers need a way of receiving donations without worrying about leaking personal details or chargebacks with platforms like PayPal.

Unlike [other solutions](https://www.youtube.com/watch?v=pXUYkEhH5ss), this project is meant to be entirely hosted and operated by you, meaning [people like haz3m don't take a 10% cut off your donations](https://www.reddit.com/r/roblox/comments/tanvus/robloxs_gamepass_sales_have_a_hidden_10_fee_that/).

This resource allows you to host a public web server and have a game send Robux donation data to it.

## What?

API hosted on "/api/donations" using ExpressJS. All static content (HTML of the alert) is hosted under "/public". If multiple donations are sent at the same time, they will be put on a queue and won't play at the same time.

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/) (or any code editor of your choice)
- [Node.js](https://nodejs.org/en/download)
- A hosting platform (eg. Vercel, Netlify, etc.)
- A Roblox game with HTTP Requests enabled.
- OBS Studio

## How?

1. [Download this repository](https://github.com/Ransomwave/Roblox-Stream-Donations/archive/refs/heads/master.zip) or clone it using:
   ```
   git clone https://github.com/Ransomwave/Roblox-Stream-Donations.git
   ```
2. Open the project folder in your code editor (e.g. Visual Studio Code).
3. Run the `npm i` command to install all project dependencies.
4. Copy the `.env.example` file, modify the default `CLIENT_SECRET` and save it as `.env`.
5. Customize the HTML code (the `index.html` file) to your liking. (Change the style, text, gif, music... Anything!)
6. Publish your web server to a host (eg. Vercel or Netlify).
7. On Roblox, use the .rblx place file linked below _(THERE WILL BE A TEMPLATE SOON)_ or create your own.
   - Make sure the HTTP requests are pointing to `/api/donations` _(eg. https://your-amazing-website.vercel.io/api/donations)_
8. Once you're happy with how your donations look, create a repository on GitHub and upload your code.
9. Sign up to a free host like [Vercel](https://vercel.com)
10. Make a new Project & associate it with your new repository.
11. Once It's uploaded, copy the generated URL (eg. https://your-amazing-website.vercel.io/)
12. Add the link as a Browser Source to OBS

## How do I send requests from Roblox?

You can use Roblox's HTTP Service to send a request every time a Developer Product is bought, for example.

Here's a code example.

```lua
local MarketplaceService = game:GetService("MarketplaceService")
local HttpService = game:GetService("HttpService")
local Players = game.Players
local url = "http://localhost:12000/api/donations" -- Replace with your domain (ex. https://donos-example.vercel.io/api/donations).
local CLIENT_SECRET = "roblox"

local Donations = {
	[50] = 1910955952; -- Your product IDs go here.
	[75] = 1910959318; -- I made the index of each one represent the amount of the donation for simplicity's sake.
	[100] = 1910960735; -- But you can configure it the way your heart desires.
	[500] = 1910962141;
	[1000] = 1910962556;
	[5000] = 1910962869;
	[10000] = 1910963800;
}

function sendDonation(donorName, amount, donorMsg)
	local data = {
		donorName = donorName,
		amount = amount,
		donorMessage = donorMsg,
		clientSecret = CLIENT_SECRET
	}
	local jsonData = HttpService:JSONEncode(data)

	--print(jsonData)
	HttpService:PostAsync(url, jsonData, Enum.HttpContentType.ApplicationJson)

end

-- Table setup containing product IDs and functions for handling purchases

local productFunctions = {}

for i,v in Donations do
	productFunctions[v] = function(receipt, player:Player)
		local info = MarketplaceService:GetProductInfo(v, Enum.InfoType.Product)
		sendDonation(`{player.DisplayName} (@{player.Name})`, info.PriceInRobux, player.PlayerGui.ScreenGui.SendTTSDialog.TextBox.Text)
		return true
	end
	print(`Inserted index {i}, value {v}`)
end

local function processReceipt(receiptInfo)
	local userId = receiptInfo.PlayerId
	local productId = receiptInfo.ProductId

	local player = Players:GetPlayerByUserId(userId)
	if player then
		-- Get the handler function associated with the developer product ID and attempt to run it
		local handler = productFunctions[productId]
		local success, result = pcall(handler, receiptInfo, player)
		if success then

			--task.wait(5)

			return Enum.ProductPurchaseDecision.PurchaseGranted
		else
			warn("Failed to process receipt:", receiptInfo, result)
		end
	end

	-- The user's benefits couldn't be awarded
	-- Return "NotProcessedYet" to try again next time the user joins
	return Enum.ProductPurchaseDecision.NotProcessedYet
end

-- Set the callback; this can only be done once by one server-side script
MarketplaceService.ProcessReceipt = processReceipt

```

This code will send an HTTP request to your server each time a Developer Product is purchased.

### Is sending the CLIENT_SECRET in the body safe?

Since Roblox only allows HTTP Requests from the server, it is practically impossible for a malicious client to find out your CLIENT_SECRET.
