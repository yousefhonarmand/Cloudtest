const express = require("express");
const cors = require("cors");
const ping = require("ping");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

// Load servers from JSON
let servers = [];
const loadServers = () => {
  try {
    const data = fs.readFileSync("./servers.json", "utf8");
    servers = JSON.parse(data);
  } catch (err) {
    console.error("Error loading servers.json", err);
    servers = [];
  }
};
loadServers();

// Function to update server status and latency asynchronously
const updateServerStatus = async (server) => {
  try {
    let res;
    if (process.env.RAILWAY) {
      // Railway ممکنه ping کار نکنه -> fallback با mock latency
      res = { alive: true, time: Math.floor(Math.random() * 100) + 10 };
    } else {
      res = await ping.promise.probe(server.ip, { timeout: 2 });
    }

    server.status = res.alive ? "up" : "down";
    server.latency = res.time ? parseFloat(res.time) : null;
    // Simulate CPU/RAM usage for demo
    server.cpu =
      server.status === "up" ? Math.floor(Math.random() * 50 + 10) : null;
    server.ram =
      server.status === "up" ? Math.floor(Math.random() * 70 + 20) : null;
  } catch (err) {
    server.status = "down";
    server.latency = null;
    server.cpu = null;
    server.ram = null;
  }
};

// API: Get all servers with updated status
app.get("/status", async (req, res) => {
  await Promise.all(servers.map((s) => updateServerStatus(s)));
  res.json(servers);
});

// API: Get specific server
app.get("/server/:id", async (req, res) => {
  const server = servers.find((s) => s.id == req.params.id);
  if (!server) return res.status(404).json({ error: "Server not found" });
  await updateServerStatus(server);
  res.json(server);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
