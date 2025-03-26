// Inisialisasi websocket client
const socket = io();

// Fungsi untuk buat object chart
function createChart(ctx, borderColor, label) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: label,
          data: [],
          borderColor: borderColor,
          borderWidth: 1,
          fill: true,
        },
      ],
    },
  });
}

// Fungsi untuk update chart
function updateChart(chart, label, value) {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// Table
let sensorATableData = [];
const tableSensorA = new gridjs.Grid({
  columns: ["Time", "Sensor A"],
  data: [],
}).render(document.getElementById("tableSensorA"));

let sensorBTableData = [];
const tableSensorB = new gridjs.Grid({
  columns: ["Time", "Sensor B"],
  data: [],
}).render(document.getElementById("tableSensorB"));

// Listen data dari server
// TODO
const ctxSensorA = document.getElementById("chartSensorA");
const ctxSensorB = document.getElementById("chartSensorB");

const chartSensorA = createChart(ctxSensorA, "red", "Sensor A");
const chartSensorB = createChart(ctxSensorB, "Blue", "Sensor B");

socket.on("randomData", (data) => {
  // Code di bawah dijalankan ketika ada randomData baru yang masuk
  document.getElementById("dataSensorA").innerHTML = data.sensorA;
  document.getElementById("dataSensorB").innerHTML = data.sensorB;

  // Update Chart
  updateChart(chartSensorA, data.time, data.sensorA);
  updateChart(chartSensorB, data.time, data.sensorB);

  sensorATableData.push([data.time, data.sensorA]);
  sensorBTableData.push([data.time, data.sensorB]);

  tableSensorA.updateConfig({ data: sensorATableData }).forceRender();
  tableSensorB.updateConfig({ data: sensorBTableData }).forceRender();
});

// Sensor A
socket.on("averageDataSensor1", (data) => {
  document.getElementById("averageSensorA").innerHTML = data;
});

socket.on("highestDataSensor1", (data) => {
  document.getElementById("highestSensorA").innerHTML = data;
});

socket.on("lowestDataSensor1", (data) => {
  document.getElementById("lowestSensorA").innerHTML = data;
});

// Sensor B
socket.on("averageDataSensor2", (data) => {
  document.getElementById("averageSensorB").innerHTML = data;
});

socket.on("highestDataSensor2", (data) => {
  document.getElementById("highestSensorB").innerHTML = data;
});

socket.on("lowestDataSensor2", (data) => {
  document.getElementById("lowestSensorB").innerHTML = data;
});

alert("Data terlalu tinggi");
