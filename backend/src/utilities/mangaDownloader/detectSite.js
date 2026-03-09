export const detectSite = (url) => {
  if (url.includes("mangadex.org")) return "mangadex";
  if (url.includes("namicomi.com")) return "namicomi";
  return "generic";
};