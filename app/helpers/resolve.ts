import { ThreadiverseClient, type ResolveObjectResponse } from "threadiverse";
import { TTLCache } from "@isaacs/ttlcache";
import resolveFedilink from "~/services/activitypub";

// Cache for resolved objects with 15-minute TTL
const resolveCache = new TTLCache<string, Promise<ResolveObjectResponse>>({
  ttl: 1000 * 60 * 15, // 15 minutes in milliseconds
});

export const POST_PATH = /^\/post\/(\d+)$/;

export const COMMENT_PATH = /^\/comment\/(\d+)$/;

export const LEMMY_CLIENT_HEADERS = {
  "User-Agent": "vger.to",
} as const;

/**
 * Lemmy 0.19.4 added a new url format to reference comments,
 * in addition to `COMMENT_PATH`.
 *
 * It is functionally exactly the same. IDK why
 *
 * https://github.com/LemmyNet/lemmy-ui/commit/b7fe70d8c15fe8c8482c8403744f24f63d1c505a#diff-13e07e23177266e419a34a839636bcdbd2f6997000fb8e0f3be26c78400acf77R145
 */
export const COMMENT_VIA_POST_PATH = /^\/post\/\d+\/(\d+)$/;

export const PIEFED_COMMENT_PATH_AND_HASH =
  /^\/post\/\d+\/[^#]+#comment_(\d+)$/;

export const USER_PATH =
  /^\/u\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;
export const COMMUNITY_PATH =
  /^\/c\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;

export function matchLemmyOrPiefedCommunity(
  urlPathname: string
): [string, string] | [string] | null {
  const matches = urlPathname.match(COMMUNITY_PATH);
  if (matches && matches[1]) {
    const [communityName, domain] = matches[1].split("@");
    if (!domain) return [communityName!];
    return [communityName!, domain];
  }
  return null;
}

export function matchLemmyOrPiefedUser(
  urlPathname: string
): [string, string] | [string] | null {
  const matches = urlPathname.match(USER_PATH);
  if (matches && matches[1]) {
    const [userName, domain] = matches[1].split("@");
    if (!domain) return [userName!];
    return [userName!, domain];
  }
  return null;
}

/**
 * Converts a remote community/user URL to its canonical home instance URL.
 * Only applies to Lemmy/PieFed instances (detected by URL pattern).
 * For example: https://lemmy.zip/c/politics@lemmy.world -> https://lemmy.world/c/politics
 */
function getCanonicalUrl(url: string): string {
  const urlObj = new URL(url);
  const { pathname } = urlObj;

  // Check for remote community (Lemmy/PieFed pattern: /c/name@domain)
  // This pattern is specific to Lemmy/PieFed, so it's safe to transform
  const communityMatch = matchLemmyOrPiefedCommunity(pathname);
  if (communityMatch && communityMatch.length === 2) {
    const [communityName, domain] = communityMatch;
    return `https://${domain}/c/${communityName}`;
  }

  // Check for remote user (Lemmy/PieFed pattern: /u/name@domain)
  // This pattern is specific to Lemmy/PieFed, so it's safe to transform
  const userMatch = matchLemmyOrPiefedUser(pathname);
  if (userMatch && userMatch.length === 2) {
    const [userName, domain] = userMatch;
    return `https://${domain}/u/${userName}`;
  }

  // Return original URL if not a Lemmy/PieFed remote community/user pattern
  // This ensures we don't transform URLs from other Fediverse software
  return url;
}

/**
 * Internal implementation of resolveObject without caching.
 * This is the actual logic that makes the API calls.
 */
async function _resolveObjectUncached(
  url: string,
  signal?: AbortSignal
): Promise<ResolveObjectResponse> {
  const canonicalUrl = getCanonicalUrl(url);
  const fedilink = await resolveFedilink(canonicalUrl, { signal });

  if (!fedilink) {
    throw new Error("Could not find fedilink");
  }

  try {
    return await _resolveObjectUncachedWithInstance(
      buildInstanceUrl(getHostname(url)),
      fedilink,
      signal
    );
  } catch (error) {
    console.error(error);

    return _resolveObjectUncachedWithInstance(
      buildInstanceUrl("lemmy.zip"),
      fedilink,
      signal
    );
  }
}

async function _resolveObjectUncachedWithInstance(
  instance: string,
  fedilink: string,
  signal?: AbortSignal
): Promise<ResolveObjectResponse> {
  return new ThreadiverseClient(instance, {
    headers: LEMMY_CLIENT_HEADERS,
  }).resolveObject(
    {
      q: fedilink,
    },
    { signal }
  );
}

/**
 * Resolves a Lemmy object URL, with caching to prevent duplicate API calls.
 * The cache has a 15-minute TTL.
 */
export const resolveObject = async (
  url: string,
  signal?: AbortSignal
): Promise<ResolveObjectResponse> => {
  const normalizedUrl = normalizeObjectUrl(url);

  // Check cache first, or create new promise
  let promise = resolveCache.get(normalizedUrl);
  if (!promise) {
    promise = _resolveObjectUncached(url, signal);
    resolveCache.set(normalizedUrl, promise);
  }

  try {
    return await promise;
  } catch (error) {
    // Remove failed requests from cache so they can be retried
    resolveCache.delete(normalizedUrl);
    throw error;
  }
};

/**
 * Sometimes the URL isn't an actual fedilink URL. For example,
 * https://piefed.social/post/123#comment_456. So try to extract the
 * fedilink from the URL if possible.
 */
function findFedilinkFromQuirkUrl(link: string): string {
  const url = new URL(link);
  const software = getDetermineSoftware(url);

  switch (software) {
    case "lemmy": {
      const response = findLemmyFedilinkFromQuirkUrl(link);
      if (response) return response;
      break;
    }
    case "piefed": {
      const response = findPiefedFedilinkFromQuirkUrl(link);
      if (response) return response;
      break;
    }
  }

  return link;
}

function getDetermineSoftware(url: URL): "lemmy" | "piefed" | "unknown" {
  // Simple heuristic: check if URL contains piefed patterns
  if (url.pathname.includes("/post/") && url.hash.includes("#comment_")) {
    return "piefed";
  }
  // Default to lemmy for most instances
  return "lemmy";
}

function findPiefedFedilinkFromQuirkUrl(link: string): string | undefined {
  const url = new URL(link);
  const { hostname } = url;

  const potentialCommentId = findPiefedCommentIdFromUrl(url);

  if (typeof potentialCommentId === "number") {
    return `https://${hostname}/comment/${potentialCommentId}`;
  }
}

function findLemmyFedilinkFromQuirkUrl(link: string): string | undefined {
  const url = new URL(link);
  const { hostname } = url;

  const potentialCommentId = findLemmyCommentIdFromUrl(url);

  if (typeof potentialCommentId === "number") {
    return `https://${hostname}/comment/${potentialCommentId}`;
  }
}

function findLemmyCommentIdFromUrl(url: URL): number | undefined {
  const { pathname } = url;

  if (COMMENT_VIA_POST_PATH.test(pathname))
    return +pathname.match(COMMENT_VIA_POST_PATH)![1]!;
}

function findPiefedCommentIdFromUrl(url: URL): number | undefined {
  const { pathname, hash } = url;

  const slug = `${pathname}${hash}`;

  if (PIEFED_COMMENT_PATH_AND_HASH.test(slug))
    return +slug.match(PIEFED_COMMENT_PATH_AND_HASH)![1]!;
}

export function normalizeObjectUrl(objectUrl: string) {
  let url = objectUrl;

  // Replace app schema "vger" with "https"
  url = url.replace(/^vger:\/\//, "https://");

  // Strip fragment (but only after quirk URL processing)
  url = url.split("#")[0]!;

  // Strip query parameters
  url = url.split("?")[0]!;

  return url;
}

export function buildInstanceUrl(instance: string) {
  return `https://${instance}`;
}

export function getHostname(url: string) {
  return new URL(url).hostname;
}
