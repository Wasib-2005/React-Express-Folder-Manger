import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { wss } from "./WebSockets/webSocket.js";

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));