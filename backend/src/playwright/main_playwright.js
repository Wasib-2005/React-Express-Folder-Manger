let chromium = null;

if (process.platform !== "android") {
  const playwright = require("playwright");
  chromium = playwright.chromium;
} else {
  console.log("Playwright disabled on Android");
}

export const findUrls = async (url, selector) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const result = await page.$$eval(selector, (elements) =>
    elements.map((el) => el.src)
  );

  await browser.close();

  return result;
};