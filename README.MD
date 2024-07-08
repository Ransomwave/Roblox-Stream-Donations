# Robux Stream Donations - Web Source for OBS

A simple server that displays Roblox donations in a Streamlabs-like way to an OBS web

## Why?

I recently got permanently suspended from PayPal. I'll cut you the details, but the reasons were absolute BS.

As I got that e-mail I thought: "Man, isn't there a way to do the same but with Roblo Robux? It seems easy enough." But, after looking around for a while, I haven't found any resource that allows you, as a streamer, to easily send HTTP requests to a web server for them to display on OBS.

This resource allows you to host your own local (or public, but you'll have to configure it yourself) webserver and have a game send donation data to it.

## What?

Rest API hosted on "http://localhost:3000/api/donations" using ExpressJS. All static content is hosted under "/public".

## How?

1. Use NPM and install ExpressJS
2. Run the server with "npm run start"
3. Point your Roblox HTTP requests to "http://localhost:3000/api/donations".
4. Make a new Browser Source in OBS and add "http://localhost:3000" as a source.
5. You're done!

## How do I send requests from Roblox?

You can use Roblox's HTTP Service to send a request every time a Developer Product is bought, for example.

Here's a code example.

```
local MarketplaceService = game:GetService("MarketplaceService")
local HttpService = game:GetService("HttpService")

function sendDonation(donorName, amount)
	local url = "http://localhost:3000/api/donations"
	local data = {
		donorName = donorName,
		amount = amount
	}
	local jsonData = HttpService:JSONEncode(data)

	HttpService:PostAsync(url, jsonData, Enum.HttpContentType.ApplicationJson)
end

```
