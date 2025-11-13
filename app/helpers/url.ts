export function parseUrl(url: string, baseUrl?: string): URL | undefined {
  try {
    return new URL(url, baseUrl);
  } catch {
    return;
  }
}

function getPotentialImageProxyUrl(url: URL): URL | undefined {
  if (url.pathname === "/api/v3/image_proxy") {
    const actualImageURL = url.searchParams.get("url");

    if (!actualImageURL) return;
    return parseUrl(actualImageURL);
  }

  return url;
}

const imageExtensions = ["jpeg", "png", "gif", "jpg", "webp", "jxl", "avif"];

export function isUrlImage(
  url: string,
  contentType: string | undefined
): boolean {
  if (contentType?.startsWith("image/")) return true;

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const unfurledUrl = getPotentialImageProxyUrl(parsedUrl);
  if (!unfurledUrl) return false;

  return imageExtensions.some((extension) =>
    unfurledUrl.pathname.endsWith(`.${extension}`)
  );
}

const animatedImageExtensions = ["gif", "webp", "jxl", "avif", "apng", "gifv"];
const animatedImageContentTypes = animatedImageExtensions.map(
  (extension) => `image/${extension}`
);

export function isUrlPotentialAnimatedImage(
  url: string,
  contentType: string | undefined
): boolean {
  if (contentType && animatedImageContentTypes.includes(contentType))
    return true;

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const unfurledUrl = getPotentialImageProxyUrl(parsedUrl);
  if (!unfurledUrl) return false;

  return animatedImageExtensions.some((extension) =>
    unfurledUrl.pathname.endsWith(`.${extension}`)
  );
}
