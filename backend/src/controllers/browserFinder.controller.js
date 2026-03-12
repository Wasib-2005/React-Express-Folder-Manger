import fs from "fs/promises";
import path from "path";

import { detectSite } from "../utilities/mangaDownloader/detectSite.js";
import { scrapeMangadex } from "../utilities/mangaDownloader/scrapeMangadex.js";
import { scrapeNamicomi } from "../utilities/mangaDownloader/scrapeNamicomi.js";

import { scrapeSequentialImages } from "../utilities/mangaDownloader/scrapeSequentialImages.js";
import { broadcast } from "../WebSockets/webSocket.js";
import { progressCounter } from "../utilities/progressCounter.js";
import { safeFolderName } from "../utilities/safeFolderName.js";
import { moveFile } from "../utilities/moveFiles.js";
import { cancelFlag } from "../utilities/flages/cancelflag.js";

export const foundManga = async (req, res) => {
  // Reset cancel flag at the start of every new scan
  cancelFlag.cancelled = false;
  progressCounter.counter = 0;

  try {
    const { url } = req.body;

    const defaultDir = path.resolve("./src/Storages/manga/temp");
    const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
      : defaultDir;
    const basePath = tempDir;

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
    broadcast({
      type: "message",
      text: "Starting manga scan...",
      progress: progressCounter.counter,
    });

    const site = detectSite(url);
    let images = [];

    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Choosing the scraper...`,
      progress: progressCounter.counter,
    });


    if (site === "mangadex") images = await scrapeMangadex(url);
    else if (site === "namicomi") images = await scrapeNamicomi(url);
   
    else images = await scrapeSequentialImages(url);

    // Check if cancelled after scraper returns
    if (cancelFlag.cancelled) {
      broadcast({
        type: "finish",
        text: "⚠ Scan cancelled",
        running: false,
        progress: progressCounter.counter,
      });
      return res.json({ success: false, cancelled: true });
    }

    images.isHorizontal = false;
    progressCounter.counter++;
    broadcast({
      type: "finish",
      text: `${images?.pages?.length ? "Done: " : "Error: "}Found ${images?.pages?.length || "0"} images `,
      running: false,
      progress: progressCounter.counter,
    });
    res.json({ success: true, imagesData: { ...images, baseUrl: basePath } });
  } catch (err) {
    if (err.message === "CANCELLED") {
      broadcast({
        type: "finish",
        text: "⚠ Scan cancelled",
        running: false,
        progress: progressCounter.counter,
      });
      return res.json({ success: false, cancelled: true });
    }
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

// ── Cancel endpoint ───────────────────────────────────────────────────────────
export const cancelManga = (req, res) => {
  cancelFlag.cancelled = true;
  broadcast({
    type: "finish",
    text: "⚠ Scan cancelled",
    running: false,
    progress: progressCounter.counter,
  });
  res.json({ success: true });
};

export const saveManga = async (req, res) => {
  console.log("saving...");

  try {
    progressCounter.counter = 0;

    const { imagesData } = req.body;
    console.log(imagesData);

    const defaultDir = path.resolve("./src/Storages/manga/save");
    const saveDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "save")
      : defaultDir;

    const baseUrl = saveDir;
    const tempUrl = imagesData.baseUrl;

    const titleFolderName = safeFolderName(imagesData?.name);
    const ep = imagesData.ep;
    const tempPageList = imagesData.pages;

    const episodeFolder = `${baseUrl}/${titleFolderName}/ep${ep}`;

    progressCounter.counter++;
    broadcast({
      type: "message",
      text: "Preparing save folder...",
      progress: progressCounter.counter,
    });

    imagesData.baseUrl = `${baseUrl}/${titleFolderName}/ep${ep}`;

    await fs.mkdir(episodeFolder, { recursive: true });

    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Saving ${tempPageList.length} pages...`,
      progress: progressCounter.counter,
    });

    for (let index = 0; index < tempPageList.length; index++) {
      const element = tempPageList[index];
      if (element.includes("@")) continue;

      await moveFile(`${tempUrl}/${element}`, episodeFolder);

      progressCounter.counter++;
      broadcast({
        type: "message",
        text: `Saved page ${index + 1}/${tempPageList.length}`,
        progress: progressCounter.counter,
      });
    }

    const jsonPath = path.join(episodeFolder, "info.json");
    await fs.writeFile(jsonPath, JSON.stringify(imagesData, null, 2));

    const indexPath = path.join(saveDir, "index.json");
    let index = [];
    try {
      const indexJson = await fs.readFile(indexPath, "utf8");
      index = JSON.parse(indexJson);
    } catch {
      index = [];
    }

    index.push(imagesData.baseUrl + "/info.json");
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    progressCounter.counter++;

    broadcast({
      type: "finish",
      text: `Done: Saved ${tempPageList.length} pages`,
      running: false,
      progress: progressCounter.counter,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Error: ${error.message}`,
      progress: progressCounter.counter,
    });
    res.status(500).json({ success: false, message: error.message });
  }
};
