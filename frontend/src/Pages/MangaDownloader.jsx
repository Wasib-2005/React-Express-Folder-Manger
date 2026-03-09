import { useState } from "react";

const MangaDownloader = () => {
  const [url, setUrl] = useState("");
  const [images, setImages] = useState([]);

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/findImg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.success) {
      setImages(data.images);
    } else {
      setImages([]);
    }
  };

  return (
    <div className="px-2 grid gap-4">
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

      {/* Render images */}
      {images.length > 0 && (
        <div className="mt-4 grid gap-4">
          {images.map((img, index) => (
            <div key={img} className="flex flex-col items-center">
              <span className="mb-2 font-medium">Page {index + 1}</span>
              <img src={img} alt={`Page ${index + 1}`} className="max-w-full rounded-lg shadow-md" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaDownloader;