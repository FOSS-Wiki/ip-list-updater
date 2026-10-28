# ip-list-updater

## Overview

Cloudflare Worker that keeps a IP list up to date with the published IP ranges for given bots. This can then be applied with a Security Rule to filter trusted bot traffic by IPs in the list.

The current sources are:
| Source | URL |
|--------|-----|
| BingBot | https://www.bing.com/toolbox/bingbot.json |
| GoogleBot | https://developers.google.com/static/crawling/ipranges/common-crawlers.json |
| DiscordBot | https://cdn.discordapp.com/ipranges/discord.json |

The script runs daily at Midnight UTC, downloads the relevant IP json files then removes duplicate ranges and updates the desription field as appropriate. If the list is too short (e.g. if fetching of IPs fails), exits to not override the list with a malformed CSV. The script replaces the contents of the list through the Cloudflare API with the updated ranges.

Any hand entered entries will be wiped on run, add your own entries to the source files if you want them to persist. Also ensure the skip runs first to avoid blocking the bots by other restrictions.

## Secrets

Set these as Worker Secrets

| Name | Description |
|------|------------|
| API_TOKEN | Cloudflare API Token with permissions to edit the list |
| ACCOUNT_ID | Your Cloudflare account ID |
| LIST_ID | The ID of the trusted_crawlers list |
