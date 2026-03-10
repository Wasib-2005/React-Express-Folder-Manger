import { WebSocketServer } from "ws";

export const clients = new Set();

export const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("WebSocket client connected"); // ✅ you should see this
  ws.on("close", () => clients.delete(ws));
});

export const broadcast = (data) => {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === client.OPEN) client.send(msg);
  }
};