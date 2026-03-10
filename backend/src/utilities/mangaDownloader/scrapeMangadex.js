import fs from "fs/promises";
import path from "path";
import axios from "axios";

import { broadcast } from "../../WebSockets/webSocket.js";
import { progressCounter } from "../progressCounter.js";

export const scrapeMangadex = async (chapterUrl) => {
  try {
    progressCounter.counter++;

    broadcast({
      type: "message",
      text: "Starting MangaDex scraper...",
      progress: progressCounter.counter,
    });

    // Extract chapterId from URL
    const chapterId = chapterUrl.split("/chapter/")[1].split("/")[0];

    // ===== GET CHAPTER INFO FROM API =====
    const chapterRes = await axios.get(
      `https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`,
    );
    const chapterData = chapterRes.data.data;

    const ep = chapterData.attributes.chapter || "unknown";

    // Find manga title
    const mangaRel = chapterData.relationships.find((r) => r.type === "manga");
    let name = "Unknown";
    if (mangaRel?.attributes?.title) {
      name =
        mangaRel.attributes.title.en ||
        Object.values(mangaRel.attributes.title)[0];
    }
    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Title found: ${name} (Chapter ${ep})`,
      progress: progressCounter.counter,
    });

    // ===== GET IMAGE LIST =====
    const atHomeRes = await axios.get(
      `https://api.mangadex.org/at-home/server/${chapterId}`,
    );
    const baseUrl = atHomeRes.data.baseUrl;
    const hash = atHomeRes.data.chapter.hash;
    const images = atHomeRes.data.chapter.data.map(
      (p) => `${baseUrl}/data/${hash}/${p}`,
    );

    // ===== PREPARE TEMP FOLDER =====
    const defaultDir = path.resolve("./src/Storages/manga/temp");
    const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
      : defaultDir;
 
    broadcast({
      type: "message",
      text: "Cleaning temp folder...",
      progress: progressCounter.counter,
    });

    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });

    broadcast({
      type: "message",
      text: `Folder ready: ${tempDir}`,
      progress: progressCounter.counter,
    });

    // ===== DOWNLOAD IMAGES =====
    const fileList = [];
    const MAX_IMAGE_RETRY = 3;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const ext = path.extname(img).split("?")[0] || ".jpg";
      const filename = `${i + 1}${ext}`;
      const filePath = path.join(tempDir, filename);

      let saved = false;
      for (let retry = 0; retry < MAX_IMAGE_RETRY; retry++) {
        try {
          const response = await axios.get(img, {
            responseType: "arraybuffer",
          });
          await fs.writeFile(filePath, response.data);

          fileList.push(filename);

          broadcast({
            type: "message",
            text: `Saved ${filename} (${i + 1}/${images.length})`,
            progress: Math.round(((i + 1) / images.length) * 100),
          });

          saved = true;
          break; // success
        } catch (err) {
          console.warn(
            `Failed to save ${filename} (attempt ${retry + 1}): ${err.message}`,
          );
          await new Promise((r) => setTimeout(r, 500)); // small delay before retry
        }
      }

      if (!saved) {
        throw new Error(
          `Failed to download image after ${MAX_IMAGE_RETRY} tries: ${img}`,
        );
      }
    }

    // ===== CREATE INFO JSON =====
    const info = {
      name,
      ep,
      source: "mangadex",
      pages: fileList,
    };

    const jsonPath = path.join(tempDir, "info.json");
    await fs.writeFile(jsonPath, JSON.stringify(info, null, 2));

    broadcast({
      type: "message",
      text: `Scraping finished → ${fileList.length} images saved`,
      progress: 100,
    });

    return info;
  } catch (err) {
    broadcast({
      type: "message",
      text: `Error: ${err.message}`,
      progress: progressCounter.counter,
    });
    throw err;
  }
};
