const socket = io();

// Chart
function createChart(ctx, borderColor, label) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor,
          borderWidth: 1,
          fill: true,
        },
      ],
    },
  });
}

function updateChart(chart, label, value) {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// Ctx Chart
const chartSensorA = createChart(
  document.getElementById("chartSensorA"),
  "red",
  "Sensor A",
);
const chartSensorB = createChart(
  document.getElementById("chartSensorB"),
  "blue",
  "Sensor B",
);

// Setup Table
let sensorATableData = [];
let sensorBTableData = [];

const tableSensorA = new gridjs.Grid({
  columns: ["Time", "Sensor A"],
  data: [],
  pagination: { limit: 10 },
}).render(document.getElementById("tableSensorA"));

const tableSensorB = new gridjs.Grid({
  columns: ["Time", "Sensor B"],
  data: [],
  pagination: { limit: 10 },
}).render(document.getElementById("tableSensorB"));

// Listen socket
socket.on("sensorData", (data) => {
  const { time, sensorA, sensorB } = data;

  // Update DOM
  document.getElementById("dataSensorA").innerText = sensorA;
  document.getElementById("dataSensorB").innerText = sensorB;

  // Update chart
  updateChart(chartSensorA, time, sensorA);
  updateChart(chartSensorB, time, sensorB);

  // Update table
  sensorATableData.push([time, sensorA]);
  sensorBTableData.push([time, sensorB]);

  tableSensorA.updateConfig({ data: sensorATableData }).forceRender();
  tableSensorB.updateConfig({ data: sensorBTableData }).forceRender();
});

// Update stats
socket.on("sensorStats", ({ sensorA, sensorB }) => {
  document.getElementById("averageSensorA").innerText = sensorA.average;
  document.getElementById("highestSensorA").innerText = sensorA.highest;
  document.getElementById("lowestSensorA").innerText = sensorA.lowest;

  document.getElementById("averageSensorB").innerText = sensorB.average;
  document.getElementById("highestSensorB").innerText = sensorB.highest;
  document.getElementById("lowestSensorB").innerText = sensorB.lowest;
});

// Tab
const tab1Btn = document.getElementById("tab1-btn");
const tab2Btn = document.getElementById("tab2-btn");
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");

tab1Btn.addEventListener("click", () => {
  tab1.classList.remove("hidden");
  tab2.classList.add("hidden");
  tab1Btn.classList.add("bg-red-600", "text-slate-100");
  tab1Btn.classList.remove("hover:bg-red-50");
  tab2Btn.classList.remove("bg-blue-600", "text-slate-100");
});

tab2Btn.addEventListener("click", () => {
  tab2.classList.remove("hidden");
  tab1.classList.add("hidden");
  tab2Btn.classList.add("bg-blue-600", "text-slate-100");
  tab2Btn.classList.remove("hover:bg-blue-50");
  tab1Btn.classList.remove("bg-red-600", "text-slate-100");
  tab1Btn.classList.add("hover:bg-red-50");
});
