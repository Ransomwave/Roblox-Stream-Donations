# Robux Stream Donations - Web Source for OBS

A simple server that displays Roblox donations in a Streamlabs-like way to an OBS web.

## Why?

I recently got permanently suspended from PayPal. I'll cut you the details, but the reasons were absolute BS.

As I got that e-mail I thought: "Man, isn't there a way to do the same but with Roblo Robux? It seems easy enough." But, after looking around for a while, I haven't found any resource that allows you, as a streamer, to easily send HTTP requests to a web server for them to display on OBS.

This resource allows you to host your own local (or public, but you'll have to configure it yourself) webserver and have a game send donation data to it.

## What?

Rest API hosted on "/api/donations" using ExpressJS. All static content is hosted under "/public". If multiple donations are sent at the same time, they will be put on a queue and won't play at the same time!

## How?

1. Download and install NPM and Visual Studio Code on your PC.
2. Use NPM to download ExpressJS
3. Clone this repository
4. Replace the default CLIENT_SECRET
5. Personalize the code as much as you want. Change the style, text, gif, music... Anything!
6. Publish your web server to a host (free ones include Vercel or Netlify).
7. On Roblox, use the .rblx place file linked below or create your own. Be sure to send the requests to the URL you got from your host (ex. https://my-epic-donations1337.vercel.io/api/donations)
   - _(COMING SOON)_
8. Add the Browser Source to OBS

## How do I send requests from Roblox?

You can use Roblox's HTTP Service to send a request every time a Developer Product is bought, for example.

Here's a code example.

```lua
local MarketplaceService = game:GetService("MarketplaceService")
local HttpService = game:GetService("HttpService")

local url = "http://localhost:3000/api/donations" -- Replace with your domain (ex. http://myamazingdomain.com/api/donations).
local CLIENT_SECRET = "roblox"

function sendDonation(donorName, amount)
	local data = {
		donorName = donorName,
		amount = amount,
		clientSecret = CLIENT_SECRET
	}
	local jsonData = HttpService:JSONEncode(data)

	HttpService:PostAsync(url, jsonData, Enum.HttpContentType.ApplicationJson)
end

MarketplaceService.PromptProductPurchaseFinished:Connect(function(player, assetId, isPurchased)
	print(`PromptProductPurchaseFinished`)
	if isPurchased == true then
		local plr = game.Players:GetPlayerByUserId(player)
		local info = MarketplaceService:GetProductInfo(assetId, Enum.InfoType.Product)
		sendDonation(plr.Name, info.PriceInRobux)
		print(`Player {plr.Name} bought {info.PriceInRobux} worth of Donations. Sent to {url}.`)
	end
end)

```

### Is sending the CLIENT_SECRET in the body safe?

Since Roblox only allows HTTP Requests from the server, it is practically impossible for a malicious client to find out your CLIENT_SECRET.
