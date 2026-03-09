import { detectSite } from "../utilities/mangaDownloader/detectSite.js";
import { scrapeGeneric } from "../utilities/mangaDownloader/scrapeGeneric.js";
import { scrapeMangadex } from "../utilities/mangaDownloader/scrapeMangadex.js";

export const foundImgs = async (req, res) => {
  try {
    const { url } = req.body;

    const site = detectSite(url);

    let images = [];

    if (site === "mangadex") {
      images = await scrapeMangadex(url);
    } else {
      images = await scrapeGeneric(url);
    }

    res.json({
      success: true,
      count: images.length,
      images,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};