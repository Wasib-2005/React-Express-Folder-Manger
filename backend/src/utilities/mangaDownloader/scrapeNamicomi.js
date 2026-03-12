import fs from "fs/promises";
import path from "path";
import axios from "axios";

import { broadcast } from "../../WebSockets/webSocket.js";
import { progressCounter } from "../progressCounter.js";
import { cancelFlag } from "../flages/cancelflag.js";




export const scrapeNamicomi = async (chapterUrl) => {
  if (process.platform === "android") {
    broadcast({ type: "message", text: "Wont work for now", running: true, progress: progressCounter.counter });
    return;
  }

  const { chromium } = await import("playwright");

  progressCounter.counter++;
  broadcast({ type: "message", text: "Starting Namicomi scraper...", running: true, progress: progressCounter.counter });

  const defaultDir = path.resolve("./src/Storages/manga/temp");
  const tempDir = process.env.MANGA_MANHUA_DOWNLOAD_PATH
    ? path.resolve(process.env.MANGA_MANHUA_DOWNLOAD_PATH, "temp")
    : defaultDir;

  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  const images  = new Set();

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("uploads.namicomi.com/chapter") && url.match(/\.(jpg|jpeg|png|webp)/i)) {
      images.add(url);
    }
  });

  if (cancelFlag.cancelled) { await browser.close(); throw new Error("CANCELLED"); }

  await page.goto(chapterUrl, { waitUntil: "domcontentloaded", timeout: 0 });

  const titleText = await page.title();
  const match = titleText.match(/Ep\.?\s*(\d+)\s*-\s*(.*?)\s*-\s*NamiComi/i);
  const ep   = match ? match[1] : "unknown";
  const name = match ? match[2] : titleText;

  progressCounter.counter++;
  broadcast({ type: "message", text: `Title found: ${name} (Ep ${ep})`, running: true, progress: progressCounter.counter });
  broadcast({ type: "message", text: "Scrolling chapter...", running: true, progress: progressCounter.counter });

  for (let i = 0; i < 120; i++) {
    if (cancelFlag.cancelled) { await browser.close(); throw new Error("CANCELLED"); } // ← check every scroll
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(300);
  }

  await page.waitForTimeout(2000);
  await browser.close();

  if (cancelFlag.cancelled) throw new Error("CANCELLED");

  const imageList = Array.from(images);
  broadcast({ type: "message", running: true, text: `Found ${imageList.length} images`, progress: progressCounter.counter });

  const fileList = [];

  for (let i = 0; i < imageList.length; i++) {
    if (cancelFlag.cancelled) throw new Error("CANCELLED");  // ← check every image

    const img      = imageList[i];
    const ext      = path.extname(img).split("?")[0] || ".jpg";
    const filename = `${i + 1}${ext}`;
    const filePath = path.join(tempDir, filename);

    const res = await axios.get(img, { responseType: "arraybuffer" });
    await fs.writeFile(filePath, res.data);
    fileList.push(filename);
    broadcast({ type: "message", text: `Found ${filename} (${i + 1}/${imageList.length})`, running: true, progress: progressCounter.counter });
  }

  const info = { name, ep, source: "namicomi", pages: fileList };
  await fs.writeFile(path.join(tempDir, "info.json"), JSON.stringify(info, null, 2));
  broadcast({ type: "message", running: true, text: `Scraping finished → ${fileList.length} images found`, progress: progressCounter.counter });

  return info;
};