import fs from "fs/promises";
import path from "path";

/**
 * Moves a file from one location to another
 * @param {string} from - Full path of the source file
 * @param {string} where - Destination folder
 */
export const moveFile = async (from, where) => {
  try {
    const fileName = path.basename(from);
    const destination = path.join(where, fileName);

    // check if file already exists
    try {
      await fs.access(destination);
      return `File already exists at destination: ${destination}`;
    } catch {
      // file does not exist → continue
    }

    await fs.rename(from, destination);

    return `File moved: ${from} → ${destination}`;
  } catch (err) {
    if (err.code === "EXDEV") {
      try {
        const fileName = path.basename(from);
        const destination = path.join(where, fileName);

        // check again for existing file
        try {
          await fs.access(destination);
          return `File already exists at destination: ${destination}`;
        } catch {}

        await fs.copyFile(from, destination);
        await fs.unlink(from);

        return `File moved (copy fallback): ${from} → ${destination}`;
      } catch (copyErr) {
        return `Error moving file ${from}: ${copyErr.message}`;
      }
    } else {
      return `Error moving file ${from}: ${err.message}`;
    }
  }
};