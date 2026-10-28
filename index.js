import SOURCES from "./sources.json";

// Extract the json files and output in the CSV format CF requires
function extractEntries(json, description) {
  return (json.prefixes || [])
    .map(p => p.ipv4Prefix || p.ipv6Prefix)
    .filter(Boolean)
    .map(ip => ({ ip, comment: description }));
}

export default {
  async scheduled(event, env, ctx) {
    const results = await Promise.all(
      SOURCES.map(async ({ url, description }) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`${url} returned ${r.status}`);
        return extractEntries(await r.json(), description);
      })
    );

    // Removes duplicates and updates the description as appropriate
    const seen = new Map();
    for (const entry of results.flat()) {
      if (seen.has(entry.ip)) {
        const existing = seen.get(entry.ip);
        const descriptions = new Set(existing.comment.split(", "));
        descriptions.add(entry.comment);
        existing.comment = [...descriptions].join(", ");
      } else {
        seen.set(entry.ip, { ...entry });
      }
    }
    const items = [...seen.values()];

    // Failsafe if fetching of IPs fails to not override the list with a malformed CSV
    if (items.length < 10) {
      throw new Error("List is too short, the IP list pull has likely failed.");
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/rules/lists/${env.LIST_ID}/items`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(items)
      }
    );

    const body = await res.json();
    if (!body.success) {
      throw new Error(`IP list update failed: ${JSON.stringify(body.errors)}`);
    }
    console.log(`Updated ${items.length} entries`);
  },
};
