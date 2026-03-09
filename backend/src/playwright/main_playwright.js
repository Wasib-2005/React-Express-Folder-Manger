// utils/findUrls.js
import { chromium } from "playwright";

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