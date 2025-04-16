const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { SerialPort, ReadlineParser } = require("serialport");

const app = express();
const server = http.createServer(app);
const socket = new Server(server);

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

app.use(express.static("app"));

const createSensorStats = () => ({
  average: 0,
  highest: -Infinity,
  lowest: Infinity,
  count: 0,
});

const sensors = {
  A: createSensorStats(),
  B: createSensorStats(),
};

const updateSensorStats = (sensor, value) => {
  sensor.average = (sensor.average * sensor.count + value) / (sensor.count + 1);
  sensor.count++;
  sensor.highest = Math.max(sensor.highest, value);
  sensor.lowest = Math.min(sensor.lowest, value);
};

parser.on("data", (line) => {
  const [sensorA, sensorB] = line.trim().split(",").map(Number);
  // const sensorA = Math.floor(Math.random() * 100);
  // const sensorB = Math.floor(Math.random() * 100);
  const timestamp = new Date().toLocaleTimeString();

  if (isNaN(sensorA) || isNaN(sensorB)) return;

  const sensorData = { sensorA, sensorB, time: timestamp };

  updateSensorStats(sensors.A, sensorA);
  updateSensorStats(sensors.B, sensorB);

  socket.emit("sensorData", sensorData);

  socket.emit("sensorStats", {
    sensorA: {
      average: sensors.A.average.toFixed(1),
      highest: sensors.A.highest,
      lowest: sensors.A.lowest,
    },
    sensorB: {
      average: sensors.B.average.toFixed(1),
      highest: sensors.B.highest,
      lowest: sensors.B.lowest,
    },
  });

  console.log(sensorData);
});

socket.on("connection", (socket) => {
  console.log("Connected");

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "app", "index.html"));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
