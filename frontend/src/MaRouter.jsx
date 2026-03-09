import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Pages/Home";
import MangaDownloader from "./Pages/MangaDownloader";

const MaRouter = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/manga-downloader", element: <MangaDownloader /> },
      { path: "/video-player" },
    ],
  },
]);

export default MaRouter;
