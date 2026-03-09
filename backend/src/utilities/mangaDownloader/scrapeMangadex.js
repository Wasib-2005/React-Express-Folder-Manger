export const scrapeMangadex = async (url) => {
  const chapterId = url.split("/chapter/")[1].split("/")[0];

  const res = await fetch(
    `https://api.mangadex.org/at-home/server/${chapterId}`
  );

  const data = await res.json();

  const baseUrl = data.baseUrl;
  const hash = data.chapter.hash;

  return data.chapter.data.map(
    (p) => `${baseUrl}/data/${hash}/${p}`
  );
};