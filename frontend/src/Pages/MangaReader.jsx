import { useEffect, useState } from "react";
import axios from "axios";
import ListManga from "../Components/Manga/Reader/ListManga";

const MangaReader = () => {
  const [listOfMangaData, setListOfMangaData] = useState([]);

  useEffect(() => {
    const getManga = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/manga/list`
        );

        setListOfMangaData(res.data.manga);
      } catch (err) {
        console.error("Failed to fetch manga:", err);
      }
    };

    getManga();
  }, []);

  return (
    <div>
      {listOfMangaData.length === 0 ? (
        <div>No Manga</div>
      ) : (
        <ListManga manga={listOfMangaData} />
      )}
    </div>
  );
};

export default MangaReader;