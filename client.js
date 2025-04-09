// websocket-client.js
const WebSocket = require("ws");

// const ws = new WebSocket("ws://localhost:8080");
const ws = new WebSocket("wss://p01--node-server-metrics--7v899zsxbhyt.salvo.code.run")

ws.on("open", () => {
  console.log("Connected to server");

  ws.send("Hello server!");

  // Optional: send periodic messages to keep it active
  setInterval(() => {
    ws.send("Ping from client");
  }, 3000);
});

ws.on("message", (data) => {
  console.log("Received from server:", data.toString());
});

ws.on("close", () => {
  console.log("Disconnected from server");
});
