import fs from "fs/promises";
import path from "path";

/**
 * Moves a file from one location to another
 * @param {string} from - Full path of the source file
 * @param {string} where - Destination folder or file path
 */
export const moveFile = async (from, where) => {
  try {
    const fileName = path.basename(from);
    const destination = path.join(where, fileName);

    await fs.rename(from, destination);

    console.log(`File moved: ${from} → ${destination}`);
  } catch (err) {
    // fallback if rename fails (different disk/partition)
    if (err.code === "EXDEV") {
      try {
        const fileName = path.basename(from);
        const destination = path.join(where, fileName);

        await fs.copyFile(from, destination);
        await fs.unlink(from);

        console.log(`File moved (copy fallback): ${from} → ${destination}`);
      } catch (copyErr) {
        console.error(`Error moving file ${from}:`, copyErr.message);
      }
    } else {  
      console.error(`Error moving file ${from}:`, err.message);
    }
  }
};
