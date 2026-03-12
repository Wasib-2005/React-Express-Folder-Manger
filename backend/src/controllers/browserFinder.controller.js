import fs from "fs/promises";
import path from "path";

import { detectSite } from "../utilities/mangaDownloader/detectSite.js";
import { scrapeMangadex } from "../utilities/mangaDownloader/scrapeMangadex.js";
import { scrapeNamicomi } from "../utilities/mangaDownloader/scrapeNamicomi.js";

import { scrapeSequentialImages } from "../utilities/mangaDownloader/scrapeSequentialImages.js";
import { broadcast } from "../WebSockets/webSocket.js";
import { progressCounter } from "../utilities/progressCounter.js";
import { deleteFolder } from "../utilities/deleteFolder.js";
import { safeFolderName } from "../utilities/safeFolderName.js";
import { moveFile } from "../utilities/moveFiles.js";

export const foundImgs = async (req, res) => {
  try {
    // Reset progress counter
    progressCounter.counter = 0;

    const { url } = req.body;

    // Determine the download folder
    const defaultDir = path.resolve("./src/Storages/manga/temp");
    const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
      : defaultDir;
    const basePath = tempDir;

    // Step 1: Clear the download folder BEFORE doing anything else
    broadcast({
      type: "message",
      text: `Clearing download folder...`,
      running: true,
      progress: progressCounter.counter,
    });
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });

    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Download folder ready: ${tempDir}`,
      running: true,
      progress: progressCounter.counter,
    });

    // Step 2: Broadcast starting message
    broadcast({
      type: "message",
      text: "Starting manga scan...",
      progress: progressCounter.counter,
    });

    // Step 3: Detect the site
    const site = detectSite(url);
    let images = [];

    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Choosing the scraper...`,
      progress: progressCounter.counter,
    });

    // Step 4: Scrape images
    if (site === "mangadex") images = await scrapeMangadex(url);
    else if (site === "namicomi") images = await scrapeNamicomi(url);
  
    else images = await scrapeSequentialImages(url);
    images.isHorizontal = false;
    progressCounter.counter++;
    broadcast({
      type: "finish",
      text: `${images?.pages?.length ? "Done: " : "Error: "}Found ${images?.pages?.length || "0"} images `,
      running: false,
      progress: progressCounter.counter,
    });
    res.json({
      success: true,
      imagesData: {
        ...images,
        baseUrl: basePath,
      },
    });
  } catch (err) {
    console.error("Error in foundImgs:", err);
    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Error: ${err.message}`,
      progress: progressCounter.counter,
    });

    res.status(500).json({ success: false, message: err.message });
  }
};
