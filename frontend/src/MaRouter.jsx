import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Pages/Home";
import MangaDownloader from "./Pages/MangaDownloader";
import MangaReader from "./Pages/MangaReader";

const MaRouter = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/manga-downloader", element: <MangaDownloader /> },
      { path: "/manga-reader", element: <MangaReader /> },
      { path: "/video-player" },
    ],
  },
]);

export default MaRouter;
