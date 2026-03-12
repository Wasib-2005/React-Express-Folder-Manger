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
      running: true,
      progress: progressCounter.counter,
    });

    // ===== Extract chapter ID safely =====
    const chapterId = chapterUrl.match(/chapter\/([a-f0-9-]+)/i)?.[1];
    if (!chapterId) throw new Error("Invalid MangaDex chapter URL");

    // ===== GET CHAPTER INFO =====
    const chapterRes = await axios.get(
      `https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`
    );
    const chapterData = chapterRes.data.data;
    const ep = chapterData.attributes.chapter || "0";

    // ===== GET MANGA TITLE SAFELY =====
    let name = "";

    // Try relationships first (new logic)
    const mangaRel = chapterData.relationships?.find((r) => r.type === "manga");

    if (mangaRel?.attributes?.title) {
      // Prefer English, then Japanese-Romanized, then first available
      name =
        mangaRel.attributes.title.en ??
        mangaRel.attributes.title["ja-ro"] ??
        Object.values(mangaRel.attributes.title)[0] ??
        "Manga"; // fallback just in case
    } else if (chapterRes.data.included) {
      // fallback: check included array
      const mangaIncluded = chapterRes.data.included.find(
        (item) => item.type === "manga" && item.attributes?.title
      );
      if (mangaIncluded) {
        name =
          mangaIncluded.attributes.title.en ??
          mangaIncluded.attributes.title["ja-ro"] ??
          Object.values(mangaIncluded.attributes.title)[0] ??
          "Manga";
      }
    } else {
      // last-resort fallback
      name = "Manga";
    }

    progressCounter.counter++;
    broadcast({
      type: "message",
      text: `Title found: ${name} (Chapter ${ep})`,
      running: true,
      progress: progressCounter.counter,
    });

    // ===== GET IMAGE LIST =====
    const atHomeRes = await axios.get(
      `https://api.mangadex.org/at-home/server/${chapterId}`
    );
    const baseUrl = atHomeRes.data.baseUrl;
    const hash = atHomeRes.data.chapter.hash;
    const images = atHomeRes.data.chapter.data.map(
      (p) => `${baseUrl}/data/${hash}/${p}`
    );

    // ===== PREPARE TEMP FOLDER =====
    const defaultDir = path.resolve("./src/Storages/manga/temp");
    const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
      : defaultDir;

    broadcast({
      type: "message",
      text: "Cleaning temp folder...",
      running: true,
      progress: progressCounter.counter,
    });

    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });

    broadcast({
      type: "message",
      text: `Folder ready: ${tempDir}`,
      running: true,
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
          const response = await axios.get(img, { responseType: "arraybuffer" });
          await fs.writeFile(filePath, response.data);
          fileList.push(filename);

          broadcast({
            type: "message",
            text: `Downloaded ${filename} (${i + 1}/${images.length})`,
            running: true,
            progress: progressCounter.counter,
          });

          saved = true;
          break;
        } catch (err) {
          console.warn(`Failed ${filename} (retry ${retry + 1}): ${err.message}`);
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      if (!saved) throw new Error(`Failed to download image: ${img}`);
    }

    // ===== CREATE INFO.JSON =====
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
      running: true,
      progress: progressCounter.counter,
    });

    return info;
  } catch (err) {
    broadcast({
      type: "message",
      running: true,
      text: `Error: ${err.message}`,
      progress: progressCounter.counter,
    });
    throw err;
  }
};