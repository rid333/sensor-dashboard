// Import module yang diperlukan
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// Inisialisasi HTTP Server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve semua file yang ada di folder app
app.use(express.static("app"));

// Variable-variable penting
let intervalStarted = false;
let averageDataSensor1 = 0;
let highestDataSensor1 = 0;
let lowestDataSensor1 = 100;

// Kirim data ke client via websockets
io.on("connection", (socket) => {
  // Log ke terminal jika client terhubung
  console.log("User connected");

  if (!intervalStarted) {
    intervalStarted = true;
    // TODO
    setInterval(() => {
      const randomData = {
        sensorA: Math.floor(Math.random() * 100),
        sensorB: Math.floor(Math.random() * 100),
        time: new Date().toLocaleTimeString(),
      };

      averageDataSensor1 = (averageDataSensor1 + randomData.sensorA) / 2;
      if (randomData.sensorA > highestDataSensor1) {
        highestDataSensor1 = randomData.sensorA;
      }
      if (randomData.sensorA < lowestDataSensor1) {
        lowestDataSensor1 = randomData.sensorA;
      }

      io.emit("randomData", randomData);
      io.emit("averageDataSensor1", averageDataSensor1.toFixed(1));
      io.emit("highestDataSensor1", highestDataSensor1);
      io.emit("lowestDataSensor1", lowestDataSensor1);
      console.log(randomData);
    }, 1000);
  }

  // Log ke terminal jika client terhubung
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Serve app/index.html di root dir
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "app", "index.html"));
});

// Start server di port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
