import fs from "fs/promises";
import path from "path";
import axios from "axios";

import { broadcast } from "../../WebSockets/webSocket.js";
import { progressCounter } from "../progressCounter.js";
import { cancelFlag } from "../flages/cancelflag.js";




export const scrapeMangadex = async (chapterUrl) => {
  try {
    progressCounter.counter++;
    broadcast({ type: "message", text: "Starting MangaDex scraper...", running: true, progress: progressCounter.counter });

    const chapterId = chapterUrl.match(/chapter\/([a-f0-9-]+)/i)?.[1];
    if (!chapterId) throw new Error("Invalid MangaDex chapter URL");

    const chapterRes  = await axios.get(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`);
    const chapterData = chapterRes.data.data;
    const ep          = chapterData.attributes.chapter || "0";

    let name = "";
    const mangaRel = chapterData.relationships?.find((r) => r.type === "manga");
    if (mangaRel?.attributes?.title) {
      name = mangaRel.attributes.title.en ?? mangaRel.attributes.title["ja-ro"] ?? Object.values(mangaRel.attributes.title)[0] ?? "Manga";
    } else if (chapterRes.data.included) {
      const inc = chapterRes.data.included.find((item) => item.type === "manga" && item.attributes?.title);
      if (inc) name = inc.attributes.title.en ?? inc.attributes.title["ja-ro"] ?? Object.values(inc.attributes.title)[0] ?? "Manga";
    } else {
      name = "Manga";
    }

    progressCounter.counter++;
    broadcast({ type: "message", text: `Title found: ${name} (Chapter ${ep})`, running: true, progress: progressCounter.counter });

    if (cancelFlag.cancelled) throw new Error("CANCELLED");

    const atHomeRes = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const baseUrl   = atHomeRes.data.baseUrl;
    const hash      = atHomeRes.data.chapter.hash;
    const images    = atHomeRes.data.chapter.data.map((p) => `${baseUrl}/data/${hash}/${p}`);

    const defaultDir = path.resolve("./src/Storages/manga/temp");
    const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
      : defaultDir;

    broadcast({ type: "message", text: "Cleaning temp folder...", running: true, progress: progressCounter.counter });
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });
    broadcast({ type: "message", text: `Folder ready: ${tempDir}`, running: true, progress: progressCounter.counter });

    const fileList = [];
    const MAX_IMAGE_RETRY = 3;

    for (let i = 0; i < images.length; i++) {
      if (cancelFlag.cancelled) throw new Error("CANCELLED");  // ← check every image

      const img      = images[i];
      const ext      = path.extname(img).split("?")[0] || ".jpg";
      const filename = `${i + 1}${ext}`;
      const filePath = path.join(tempDir, filename);

      let saved = false;
      for (let retry = 0; retry < MAX_IMAGE_RETRY; retry++) {
        if (cancelFlag.cancelled) throw new Error("CANCELLED");  // ← check every retry
        try {
          const response = await axios.get(img, { responseType: "arraybuffer" });
          await fs.writeFile(filePath, response.data);
          fileList.push(filename);
          broadcast({ type: "message", text: `Downloaded ${filename} (${i + 1}/${images.length})`, running: true, progress: progressCounter.counter });
          saved = true;
          break;
        } catch (err) {
          if (err.message === "CANCELLED") throw err;
          console.warn(`Failed ${filename} (retry ${retry + 1}): ${err.message}`);
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      if (!saved) throw new Error(`Failed to download image: ${img}`);
    }

    const info = { name, ep, source: "mangadex", pages: fileList };
    await fs.writeFile(path.join(tempDir, "info.json"), JSON.stringify(info, null, 2));
    broadcast({ type: "message", text: `Scraping finished → ${fileList.length} images saved`, running: true, progress: progressCounter.counter });

    return info;
  } catch (err) {
    if (err.message === "CANCELLED") throw err;
    broadcast({ type: "message", running: true, text: `Error: ${err.message}`, progress: progressCounter.counter });
    throw err;
  }
};