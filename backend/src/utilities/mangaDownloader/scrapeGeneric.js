export const scrapeGeneric = async (chapterUrl) => {
  if (process.platform === "android") {
    console.log("Playwright disabled on Android");
    return [];
  }

  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const images = new Set();

  page.on("response", async (response) => {
    try {
      const url = response.url();
      const type = response.headers()["content-type"] || "";

      if (type.startsWith("image/")) {
        if (!url.startsWith("blob:") && !url.startsWith("data:")) {
          images.add(url);
        }
      }
    } catch {}
  });

  await page.goto(chapterUrl, { waitUntil: "networkidle" });

  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 800;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });

  await page.waitForTimeout(2000);

  await browser.close();

  return [...images];
};