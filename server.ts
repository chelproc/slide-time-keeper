import { WebSocketServer } from "ws";
import express from "express";

const wss = new WebSocketServer({ noServer: true });
const app = express();

app.use(express.static("dist"));

app.get("/ws", (req) => {
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    ws.on("message", (data) => {
      console.log(`${new Date().toISOString()}: ${data.toString()}`);
      for (const client of wss.clients) {
        client.send(data);
      }
    });
  });
});

app.listen(8080);
