import axios from "axios";

export const scrapeSequentialImages = async (imageUrl) => {
  console.log("Sequential image scan:", imageUrl);

  const images = [];

  try {
    const match = imageUrl.match(/(.*\/)(\d+)(\.[a-zA-Z]+)/);

    if (!match) {
      throw new Error("Invalid image URL");
    }

    const base = match[1];
    const start = parseInt(match[2]);
    const ext = match[3];

    console.log("Base:", base);
    console.log("Start index:", start);

    const exists = async (url) => {
      try {
        const res = await axios.head(url, {
          timeout: 5000,
          validateStatus: () => true
        });

        return res.status === 200;
      } catch {
        return false;
      }
    };

    // scan backward
    let i = start;
    while (i > 0) {
      const url = `${base}${i}${ext}`;

      if (await exists(url)) {
        images.unshift(url);
        i--;
      } else break;
    }

    // scan forward
    i = start + 1;

    while (true) {
      const url = `${base}${i}${ext}`;

      if (await exists(url)) {
        images.push(url);
        i++;
      } else break;
    }

    console.log("Total images:", images.length);

    return images;

  } catch (err) {
    console.error("Sequential scraper error:", err.message);
    return [];
  }
};