export const safeFolderName = (name) => {
  return name
    .normalize("NFKD") // normalize unicode
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // remove OS illegal chars
    .replace(/&/g, "and") // replace &
    .trim() // remove leading/trailing spaces
    .replace(/\s+/g, "-") // spaces → hyphen
    .replace(/-+/g, "-"); // remove duplicate hyphens
};
