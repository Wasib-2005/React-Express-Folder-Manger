import { useEffect, useState } from "react";

const MangaDownloader = () => {
  const [url, setUrl] = useState("https://mangadex.org/chapter/705f2677-de63-49d3-9169-8a54d412ef81/1");
  const [images, setImages] = useState([]);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let apiUrl = import.meta.env.VITE_API_URL; // http://192.168.0.114:3000
    apiUrl = apiUrl.replace(/^https?:\/\//, ""); // 192.168.0.114:3000
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${apiUrl}`; // ws://192.168.0.114:3000
    console.log("Connecting to WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [...prev, data.text]);
      }

      if (data.type === "finished") {
        setMessages((prev) => [...prev, data.text]);
      }
    };

    return () => socket.close();
  }, []);

  const handleSubmit = async () => {
     setMessages([]);
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
      <div className="mt-4 p-2 bg-gray-100 rounded max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm font-mono">
            {msg}
          </div>
        ))}
      </div>

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
      {images?.length > 0 && (
        <div className="mt-4 grid gap-4">
          {images.map((img, index) => (
            <div key={img} className="flex flex-col items-center">
              <span className="mb-2 font-medium">Page {index + 1}</span>
              <img
                src={img}
                alt={`Page ${index + 1}`}
                className="max-w-full rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaDownloader;
