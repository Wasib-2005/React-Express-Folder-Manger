import fs from "fs/promises";
import path from "path";

export async function scanFolderViaPath(folderPath) {
  const items = await fs.readdir(folderPath, { withFileTypes: true });

  const result = await Promise.all(
    items.map(async (item) => {
      const fullPath = path.join(folderPath, item.name);
      const stats = await fs.stat(fullPath);

      return {
        name: item.name,
        type: item.isDirectory() ? "folder" : "file",
        size: stats.size,
        path: fullPath,
        modified: stats.mtime,
        created: stats.ctime,
      };
    })
  );

  return result;
}