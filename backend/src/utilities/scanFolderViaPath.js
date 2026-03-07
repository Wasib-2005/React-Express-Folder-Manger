import fs from "fs/promises";
import path from "path";

// Define extension categories
const typeMap = {
  video: [".mp4", ".mkv", ".avi", ".mov", ".webm"],
  audio: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"],
  photo: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".svg"],
  document: [".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".ppt", ".pptx"],
  archive: [".zip", ".rar", ".7z", ".tar", ".gz"],
  code: [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".html",
    ".css",
  ],
  program: [".exe", ".flatpak"],
};

function getType(itemName, isDirectory) {
  if (isDirectory) return "folder";

  const ext = path.extname(itemName).toLowerCase();
  for (const [type, exts] of Object.entries(typeMap)) {
    if (exts.includes(ext)) return type;
  }
  return "file"; // fallback for unknown file types
}

export async function scanFolderViaPath(folderPath) {
  const items = await fs.readdir(folderPath, { withFileTypes: true });
  const location = await fs.realpath(folderPath);

  const folderFile = await Promise.all(
    items.map(async (item) => {
      const fullPath = path.join(folderPath, item.name);
      const stats = await fs.stat(fullPath);

      return {
        name: item.name,
        type: getType(item.name, item.isDirectory()),
        size: stats.size,
        path: fullPath,
        modified: stats.mtime,
        created: stats.ctime,
      };
    }),
  );

  return { location, folderFile };
}
