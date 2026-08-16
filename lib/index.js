import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
const name = "ui-custom-wallpaper";

/** Services required before the plugin can mount its routes. */
const inject = ["webServer"];

/** Read the DeepSeek API key from the DSH credentials file (~/.dsh/.credentials.yaml). */
function readDeepSeekKey() {
  try {
    const home = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
    const text = fs.readFileSync(path.join(home, ".credentials.yaml"), "utf8");
    const m = text.match(/^DEEPSEEK_API_KEY:\s*(\S+)/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Register the balance route: proxies the DeepSeek /user/balance endpoint
 * server-side (the API key never leaves the host), caching the result 30s.
 */
function apply(ctx) {
  let cache = { at: 0, payload: null };

  ctx.effect(() => {
    const disposers = [];

    disposers.push(ctx.webServer.register({
      kind: "exact",
      path: "/api/custom-wallpaper/balance",
      handler: (req, res) => {
        const json = (status, body) => {
          res.writeHead(status, {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          });
          res.end(JSON.stringify(body));
        };

        if (req.method !== "GET") return json(405, { ok: false, error: "method-not-allowed" });

        if (cache.payload && Date.now() - cache.at < 30000) {
          return json(200, cache.payload);
        }

        const key = readDeepSeekKey();
        if (!key) {
          return json(200, { ok: false, error: "no-api-key" });
        }

        fetch("https://api.deepseek.com/user/balance", {
          method: "GET",
          headers: { Authorization: "Bearer " + key, Accept: "application/json" },
          signal: AbortSignal.timeout(10000)
        })
          .then((r) => {
            if (!r.ok) throw new Error(`DeepSeek balance request failed: ${r.status}`);
            return r.json();
          })
          .then((data) => {
            const payload = { ok: true, data };
            cache = { at: Date.now(), payload };
            json(200, payload);
          })
          .catch(() => {
            json(200, { ok: false, error: "fetch-failed" });
          });
      }
    }));

    return () => {
      for (const dispose of disposers) dispose();
    };
  }, "custom-wallpaper: balance route");
}

export { apply, inject, name };
