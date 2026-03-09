import { useState } from "react";

const MangaDownloader = () => {
  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/findImg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <div className="px-2 grid gap-2">
        <h1 className="font-[450] text-xl">Manga Url:</h1>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 rounded-lg border border-base-300 w-full"
        />

        <button
          onClick={handleSubmit}
          className="btn btn-outline btn-success w-[80%]"
        >
          Find The Manga
        </button>
      </div>
    </div>
  );
};

export default MangaDownloader;