# Robux Stream Donations - Web Source for OBS (TTS SUPPORT!)

A simple ExpressJS server that dynamically alerts of Roblox ROBUX donations donations to an OBS Web source, with support for **Donation messages, TTS, & more**! (Similar to Streamlabs alerts)

[🎥 Demo of this tool](https://x.com/RansomwaveGames/status/1845154297798873380)

## Why?

I recently got permanently suspended from PayPal. I'll cut you the details, but this was a massive hit for me & my Twitch. I thought: "Isn't there a way to do the same but with Roblox Robux? It seems easy enough." After looking around for a while, I was unable to find any resource that allows you, as a streamer, to easily send Robux donation alerts to an OBS web source.

This resource allows you to host your public webserver and have a game send donation data to it.

## What?

API hosted on "/api/donations" using ExpressJS. All static content (HTML of the alert) is hosted under "/public". If multiple donations are sent at the same time, they will be put on a queue and won't play at the same time.

## How?

1. Download and install NPM and Visual Studio Code on your PC.
2. Use NPM to download ExpressJS
3. Clone this repository
4. Replace the default CLIENT_SECRET
5. Personalize the code as much as you want. Change the style, text, gif, music... Anything!
6. Publish your web server to a host (free ones include Vercel or Netlify).
7. On Roblox, use the .rblx place file linked below or create your own. Be sure to send the requests to the URL you got from your host (ex. https://my-epic-donations1337.vercel.io/api/donations)
8. Add the Browser Source to OBS

## How do I send requests from Roblox?

You can use Roblox's HTTP Service to send a request every time a Developer Product is bought, for example.

Here's a code example.

```lua
local MarketplaceService = game:GetService("MarketplaceService")
local HttpService = game:GetService("HttpService")
local Players = game.Players
local url = "http://localhost:12000/api/donations" -- Replace with your domain (ex. http://myamazingdomain.com/api/donations).
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

local productFunctions = {
	
}

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

### Is sending the CLIENT_SECRET in the body safe?

Since Roblox only allows HTTP Requests from the server, it is practically impossible for a malicious client to find out your CLIENT_SECRET.
