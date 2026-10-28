# ip-list-updater

## Overview

Cloudflare Worker that keeps a IP list up to date with the published IP ranges for given bots. This can then be applied with a Security Rule to filter trusted bot traffic by IPs in the list.

The current default sources are:
| Source | URL |
|--------|-----|
| BingBot | https://www.bing.com/toolbox/bingbot.json |
| DiscordBot | https://cdn.discordapp.com/ipranges/discord.json |
| GoogleBot | https://developers.google.com/static/crawling/ipranges/common-crawlers.json |

The script runs daily at Midnight UTC, downloads the relevant IP json files then removes duplicate ranges and updates the desription field as appropriate. If the list is too short (e.g. if fetching of IPs fails), exits to not override the list with a malformed CSV. The script replaces the contents of the list through the Cloudflare API with the updated ranges.

Any hand entered entries will be wiped on run, add your own entries to the source files if you want them to persist. Also ensure the skip runs first to avoid blocking the bots by other restrictions.

## Setup

1. Fork the repository into your own account/organisation.
2. Edit the sources array as appropriate for your needs in `index.js`, be careful that the input MAY not meet the expected format.
3. Create a Cloudflare List of IP addresses in the dashboard ([https://developers.cloudflare.com/waf/tools/lists/custom-lists](https://developers.cloudflare.com/waf/tools/lists/custom-lists)), take note of the list ID and account ID in the URL, e.g. `https://dash.cloudflare.com/<account_id>/configurations/lists/<list_id>`.
4. Create a Cloudflare API Token with permissions to edit the list ([https://developers.cloudflare.com/fundamentals/api/get-started/create-token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token)), with the `Account Rule Lists Write` & `Account Rule Lists Read` permissions for the relevant account. Take note of the token value.
5. Setup your Worker in the dashboard linked to the forked repository ([https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration))
6. Fill in the secrets in the dashboard ([https://developers.cloudflare.com/workers/configuration/secrets](https://developers.cloudflare.com/workers/configuration/secrets)) with the values in the table below.
7. Wait until the next run and check the list has been updated with the expected IPs.

### Secrets

| Name | Description |
|------|------------|
| API_TOKEN | Cloudflare API Token with permissions to edit the list |
| ACCOUNT_ID | Your Cloudflare account ID |
| LIST_ID | The ID of the Cloudflare IP list |
