import fs from "fs/promises";
import path from "path";

/**
 * Deletes a folder at the specified path.
 * @param {string} folderPath - Full path to the folder to delete
 */
export const deleteFolder = async (folderPath) => {
  try {
    // Remove folder recursively
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`Folder deleted: ${folderPath}`);
  } catch (err) {
    console.error(`Error deleting folder ${folderPath}:`, err.message);
  }
};

// Example usage:
const folderToDelete = "/home/walla/download/new";
deleteFolder(folderToDelete);