import { createHash } from "node:crypto";

const TRACKING_PARAM_PREFIXES = ["utm_"];
const TRACKING_PARAMS = new Set(["fbclid", "gclid", "mc_cid", "mc_eid", "ref"]);

export function canonicalizeUrl(input: string): string {
  const url = new URL(input.trim());
  url.hostname = url.hostname.toLowerCase();

  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAMS.has(key) || TRACKING_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      url.searchParams.delete(key);
    }
  }

  url.searchParams.sort();

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

export function hashCanonicalUrl(input: string): string {
  return createHash("sha256").update(canonicalizeUrl(input)).digest("hex");
}
