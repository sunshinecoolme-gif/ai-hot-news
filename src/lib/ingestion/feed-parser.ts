import { XMLParser } from "fast-xml-parser";

export type ParsedFeedItem = {
  title: string;
  url: string;
  summary: string | null;
  publishedAt: Date | null;
  raw: Record<string, unknown>;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text"
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return text((value as { "#text": unknown })["#text"]);
  }
  return null;
}

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "...",
    lt: "<",
    nbsp: " ",
    quot: "\"",
    rsquo: "'",
    lsquo: "'",
    rdquo: "\"",
    ldquo: "\""
  };

  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, token: string) => {
    const normalized = token.toLowerCase();

    if (normalized.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    }

    if (normalized.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    }

    return namedEntities[normalized] ?? entity;
  });
}

export function normalizeFeedText(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;

  const normalized = decodeHtmlEntities(raw)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, "\"")
    .replace(/\u2026/g, "...")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\bThe post\b[\s\S]*?\bappeared first on\b[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

function parseDate(value: unknown): Date | null {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function atomLink(link: unknown): string | null {
  if (Array.isArray(link)) {
    const alternate = link.find(
      (item) => isRecord(item) && item["@_rel"] === "alternate" && typeof item["@_href"] === "string"
    );
    if (alternate) return atomLink(alternate);

    const implicitAlternate = link.find(
      (item) => isRecord(item) && !item["@_rel"] && typeof item["@_href"] === "string"
    );
    if (implicitAlternate) return atomLink(implicitAlternate);

    const firstHref = link.find((item) => isRecord(item) && typeof item["@_href"] === "string");
    if (!firstHref || (isRecord(firstHref) && firstHref["@_rel"] === "self")) return null;
    return atomLink(firstHref);
  }
  if (typeof link === "string") return link;
  if (isRecord(link)) {
    if (link["@_rel"] === "self") return null;
    const href = link["@_href"];
    return typeof href === "string" ? href : null;
  }
  return null;
}

function parseRssItem(item: unknown): ParsedFeedItem[] {
  if (!isRecord(item)) return [];

  const title = text(item.title);
  const url = text(item.link);
  if (!title || !url || !isHttpUrl(url)) return [];

  return [
    {
      title: normalizeFeedText(item.title) ?? title,
      url,
      summary: normalizeFeedText(item.description),
      publishedAt: parseDate(item.pubDate),
      raw: item
    }
  ];
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as Record<string, unknown>;

  if (parsed.rss && typeof parsed.rss === "object") {
    const channel = (parsed.rss as Record<string, unknown>).channel;
    return asArray(channel as Record<string, unknown> | Record<string, unknown>[]).flatMap((rssChannel) => {
      if (!isRecord(rssChannel)) return [];
      return asArray(rssChannel.item as Record<string, unknown> | Record<string, unknown>[]).flatMap(parseRssItem);
    });
  }

  if (parsed.feed && typeof parsed.feed === "object") {
    const feed = parsed.feed as Record<string, unknown>;
    return asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[]).flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const title = text(entry.title);
      const url = atomLink(entry.link);
      if (!title || !url || !isHttpUrl(url)) return [];
      return [
        {
          title: normalizeFeedText(entry.title) ?? title,
          url,
          summary: normalizeFeedText(entry.summary) ?? normalizeFeedText(entry.content),
          publishedAt: parseDate(entry.updated) ?? parseDate(entry.published),
          raw: entry
        }
      ];
    });
  }

  return [];
}
