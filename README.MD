# Robux Stream Donations - Web Source for OBS (TTS SUPPORT!)

A simple ExpressJS server that dynamically alerts of Roblox ROBUX donations donations to an OBS Web source, with support for **Donation messages, TTS, & more**! (Similar to Streamlabs alerts)

## Why?

I recently got permanently suspended from PayPal. I'll cut you the details, but this was a massive hit for me & my Twitch. I thought: "Isn't there a way to do the same but with Roblox Robux? It seems easy enough." After looking around for a while, I was unable to find any resource that allows you, as a streamer, to easily send Robux donation alerts to an OBS web source.

This resource allows you to host your public webserver and have a game send donation data to it.

## What?

API hosted on "/api/donations" using ExpressJS. All static content (HTML of the alert) is hosted under "/public". If multiple donations are sent at the same time, they will be put on a queue and won't play at the same time.

## How?

1. Download & install Visual Studio Code.
2. Download & install [Git](https://git-scm.com/downloads)
3. Download & install [Node.js](https://nodejs.org/en/download).
4. Clone this repository: `git clone https://github.com/Ransomwave/Roblox-Stream-Donations`
5. Run the `npm i` commannd to install all project dependencies.
6. Edit `server.js` & replace the default `CLIENT_SECRET`.
7. Customize the HTML code (the `index.html` file) to your liking. (Change the style, text, gif, music... Anything!)
8. Publish your web server to a host (eg. Vercel or Netlify).
9. On Roblox, use the .rblx place file linked below _(THERE WILL BE A TEMPLATE SOON)_ or create your own. 
   * Make sure the HTTP requests are pointing to `/api/donations` _(eg. https://your-amazing-website.vercel.io/api/donations)_
10. Once you're happy with how your donations look, create a repository on GitHub and upload your code.
11. Sign up to a free host like [Vercel](https://vercel.com)
12. Make a new Project & associate it with your new repository.
13. Once It's uploaded, copy the generated URL (eg. https://your-amazing-website.vercel.io/)
14. Add the link as a Browser Source to OBS

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
