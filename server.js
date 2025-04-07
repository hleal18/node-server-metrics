const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const client = require("prom-client");

// --- Prometheus Metrics ---
const register = new client.Registry();
// client.collectDefaultMetrics({ register });

const openConnectionsGauge = new client.Gauge({
  name: "tcp_open_connections_total",
  help: "Current number of open TCP connections",
});

register.registerMetric(openConnectionsGauge);

// --- HTTP and WebSocket Setup ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Track open sockets
const openSockets = new Set();

server.on("connection", (socket) => {
  openSockets.add(socket);
  openConnectionsGauge.set(openSockets.size);
  console.log("Opened a new tcp connection: ", openSockets.size);
  socket.on("close", () => {
    openSockets.delete(socket);
    openConnectionsGauge.set(openSockets.size);
    console.log("Closed an existing tcp connection: ", openSockets.size);
  });
});

// --- HTTP Routes ---
app.get("/", (req, res) => {
  res.send("Hello from HTTP!");
});

// Request to metrics may add an extra temporary tcp opened connection while request is done.
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// --- WebSocket Events ---
wss.on("connection", (ws) => {
  ws.send("Hello from WebSocket!");
  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    ws.send(`Echo: ${message}`);
  });
  ws.on("close", () => {
    console.log("Connection ended");
    ws.send("Bye from server, connection closed");
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

setInterval(
  () =>
    console.log("Interval current open tcp connections: ", openSockets.size),
  5000
);
