// Import module yang diperlukan
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { SerialPort, ReadlineParser } = require("serialport");

// Inisialisasi HTTP Server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Inisialisasi koneksi dari Arduino melalui SerialPort
const port = new SerialPort({
  path: "/dev/ttyACM0",
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// Serve semua file yang ada di folder app
app.use(express.static("app"));

// Variable-variable penting
let intervalStarted = false;

// Sensor A
let averageDataSensor1 = 0;
let highestDataSensor1 = 0;
let lowestDataSensor1 = 100;

// SensorB
let averageDataSensor2 = 0;
let highestDataSensor2 = 0;
let lowestDataSensor2 = 100;

// Kirim data ke client via websockets
io.on("connection", (socket) => {
  // Log ke terminal jika client terhubung
  console.log("User connected");

  if (!intervalStarted) {
    intervalStarted = true;
    // TODO
    parser.on("data", (data) => {
      const line = data.split(",");
      const randomData = {
        sensorA: parseInt(line[0]),
        sensorB: parseInt(line[1]),
        time: new Date().toLocaleTimeString(),
      };

      // Sensor A
      averageDataSensor1 = (averageDataSensor1 + randomData.sensorA) / 2;
      if (randomData.sensorA > highestDataSensor1) {
        highestDataSensor1 = randomData.sensorA;
      }
      if (randomData.sensorA < lowestDataSensor1) {
        lowestDataSensor1 = randomData.sensorA;
      }

      // Sensor B
      averageDataSensor2 = (averageDataSensor2 + randomData.sensorB) / 2;
      if (randomData.sensorB > highestDataSensor2) {
        highestDataSensor2 = randomData.sensorB;
      }
      if (randomData.sensorB < lowestDataSensor2) {
        lowestDataSensor2 = randomData.sensorB;
      }

      io.emit("randomData", randomData);

      // Sensor A
      io.emit("averageDataSensor1", averageDataSensor1.toFixed(1));
      io.emit("highestDataSensor1", highestDataSensor1);
      io.emit("lowestDataSensor1", lowestDataSensor1);

      // Sensor B
      io.emit("averageDataSensor2", averageDataSensor2.toFixed(1));
      io.emit("highestDataSensor2", highestDataSensor2);
      io.emit("lowestDataSensor2", lowestDataSensor2);
      console.log(randomData);
    });
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
