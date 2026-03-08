export function formatSize(size, toWhat = "MB") {
  const sizesList = ["B", "KB", "MB", "GB", "TB"];

  const index = sizesList.indexOf(toWhat.toUpperCase());
  if (index === -1) return size; // invalid unit

  const formattedSize = size / 1024 ** index;

  return formattedSize.toFixed(2) + " " + toWhat.toUpperCase();
}

export function autoFormatSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return bytes.toFixed(2) + " " + units[i];
}