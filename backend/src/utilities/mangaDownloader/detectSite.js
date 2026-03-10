export const detectSite = (url) => {
  if (url.includes("mangadex")) return "mangadex";
  if (url.includes("namicomi")) return "namicomi";
  return "generic";
};
 