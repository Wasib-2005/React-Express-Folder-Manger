import fs from "fs/promises";
import path from "path";
import axios from "axios";

import { broadcast } from "../../WebSockets/webSocket.js";
import { progressCounter } from "../progressCounter.js";

export const scrapeSequentialImages = async (imageUrl) => {
  const images = [];

  try {
    progressCounter.counter++;

    broadcast({
      type: "message",
      text: "Starting sequential image scraper...",
      running: true,
      progress: progressCounter.counter,
    });

    const match = imageUrl.match(/(.*\/)(\d+)(\.[a-zA-Z]+)/);

    if (!match) throw new Error("Invalid image URL");

    const base = match[1];
    const start = parseInt(match[2]);

    const EXTENSIONS = [".webp", ".gif", ".jpg", ".jpeg", ".png"];

    broadcast({
      type: "message",
      text: `Base detected: ${base}`,
      running: true,
      progress: progressCounter.counter,
    });

    const exists = async (url) => {
      try {
        const res = await axios.head(url, {
          timeout: 5000,
          validateStatus: () => true,
        });

        return res.status === 200;
      } catch {
        return false;
      }
    };

    const findImage = async (index) => {
      for (const ext of EXTENSIONS) {
        const url = `${base}${index}${ext}`;

        broadcast({
          type: "message",
          text: `Trying ${url}`,
          running: true,
          progress: progressCounter.counter,
        });

        const ok = await exists(url);

        if (ok) {
          broadcast({
            type: "message",
            text: `Success: ${url}`,
            running: true,
            progress: progressCounter.counter,
          });

          return url;
        } else {
          broadcast({
            type: "message",
            text: `Failed: ${url}`,
            running: true,
            progress: progressCounter.counter,
          });
        }
      }

      return null;
    };

    // ===== BACKWARD SCAN =====
    let i = start;

    while (i > 0) {
      const url = await findImage(i);

      if (url) {
        images.unshift(url);
        i--;
      } else break;
    }

    // ===== FORWARD SCAN =====
    i = start + 1;

    while (true) {
      const url = await findImage(i);

      if (url) {
        images.push(url);
        i++;
      } else break;
    }

    broadcast({
      type: "message",
      text: `Total images found: ${images.length}`,
      running: true,
      progress: progressCounter.counter,
    });

    // ===== TEMP FOLDER =====
    const defaultDir = path.resolve("./src/Storages/manga/temp");

    const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
      ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
      : defaultDir;

    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });

    const fileList = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      const ext = path.extname(img);
      const filename = `${i + 1}${ext}`;
      const filePath = path.join(tempDir, filename);

      const res = await axios.get(img, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      await fs.writeFile(filePath, res.data);

      fileList.push(filename);

      broadcast({
        type: "message",
        text: `Saved ${filename} (${i + 1}/${images.length})`,
        running: true,
        progress: progressCounter.counter,
      });
    }

    const info = {
      name: "Sequential Images",
      ep: `start-${start}`,
      source: "sequential",
      pages: fileList,
    };

    await fs.writeFile(
      path.join(tempDir, "info.json"),
      JSON.stringify(info, null, 2),
    );

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
      text: `Error: ${err.message}`,
      running: true,
      progress: progressCounter.counter,
    });

    throw err;
  }
};
