import fs from "fs/promises";
import path from "path";

export const mangaList = async (req, res) => {
  console.log("Fetching manga list...");

  const folderPath = `${
    process.env.MANGA_MANHUA_DOWNLOAD_PATH || "./src/Storages/manga/"
  }save`;

  try {
    const indexPath = path.join(folderPath, "index.json");

    // read index file (list of saved manga paths)
    const indexJson = await fs.readFile(indexPath, "utf8");
    const index = JSON.parse(indexJson);

    // store all manga entries in an array
    const mangaList = [];

    for (let i = 0; i < index.length; i++) {
      const mangaFilePath = index[i];
      try {
        const mangaDataJson = await fs.readFile(mangaFilePath, "utf8");
        const mangaData = JSON.parse(mangaDataJson);

        mangaList.push(mangaData);
      } catch (innerErr) {
        console.warn(`Failed to read manga file ${mangaFilePath}:`, innerErr.message);
      }
    }

    res.json({
      success: true,
      manga: mangaList,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};