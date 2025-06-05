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

const windRoseData = {
  Utara: 0,
  "Timur Laut": 0,
  Timur: 0,
  Tenggara: 0,
  Selatan: 0,
  "Barat daya": 0,
  Barat: 0,
  "Barat laut": 0,
};

let windRoseChart;
function updateWindRose(direction) {
  windRoseData[direction] = (windRoseData[direction] || 0) + 1;
  const directions = Object.keys(windRoseData);
  const counts = Object.values(windRoseData);

  if (!windRoseChart) {
    windRoseChart = new Chart(document.getElementById("windRoseChart"), {
      type: "polarArea",
      data: {
        labels: directions,
        datasets: [
          {
            label: "Wind Frequency",
            data: counts,
            backgroundColor: [
              "#f87171",
              "#facc15",
              "#4ade80",
              "#60a5fa",
              "#a78bfa",
              "#fb923c",
              "#38bdf8",
              "#f472b6",
            ],
          },
        ],
      },
      options: {
        scales: {
          r: {
            ticks: { color: "#334155", backdropColor: "transparent" },
            grid: { color: "#cbd5e1" },
          },
        },
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  } else {
    windRoseChart.data.datasets[0].data = counts;
    windRoseChart.update();
  }
}

// Setup Table
let sensorATableData = [];
let sensorBTableData = [];
let sensorCTableData = [];

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

const tableSensorC = new gridjs.Grid({
  columns: ["Time", "Sensor C"],
  data: [],
  pagination: { limit: 10 },
}).render(document.getElementById("tableSensorC"));

// Listen socket
socket.on("sensorData", (data) => {
  const { time, sensorA, sensorB, sensorC } = data;

  // Update DOM
  document.getElementById("dataSensorA").innerText = sensorA;
  document.getElementById("dataSensorB").innerText = sensorB;
  document.getElementById("dataSensorC").innerText = sensorC;

  // Update charts
  updateChart(chartSensorA, time, sensorA);
  updateChart(chartSensorB, time, sensorB);
  updateWindRose(sensorC);

  // Update tables
  sensorATableData.push([time, sensorA]);
  sensorBTableData.push([time, sensorB]);
  sensorCTableData.push([time, sensorC]);

  tableSensorA.updateConfig({ data: sensorATableData }).forceRender();
  tableSensorB.updateConfig({ data: sensorBTableData }).forceRender();
  tableSensorC.updateConfig({ data: sensorCTableData }).forceRender();
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
const tab3Btn = document.getElementById("tab3-btn");
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");
const tab3 = document.getElementById("tab3");

tab1Btn.addEventListener("click", () => {
  tab1.classList.remove("hidden");
  tab2.classList.add("hidden");
  tab3.classList.add("hidden");

  tab1Btn.classList.add("bg-red-600", "text-slate-100");
  tab1Btn.classList.remove("hover:bg-red-50");
  tab2Btn.classList.remove("bg-blue-600", "text-slate-100");
  tab2Btn.classList.add("hover:bg-blue-50");
  tab3Btn.classList.remove("bg-yellow-600", "text-slate-100");
  tab3Btn.classList.add("hover:bg-yellow-50");
});

tab2Btn.addEventListener("click", () => {
  tab2.classList.remove("hidden");
  tab1.classList.add("hidden");
  tab3.classList.add("hidden");

  tab2Btn.classList.add("bg-blue-600", "text-slate-100");
  tab2Btn.classList.remove("hover:bg-blue-50");
  tab1Btn.classList.remove("bg-red-600", "text-slate-100");
  tab1Btn.classList.add("hover:bg-red-50");
  tab3Btn.classList.remove("bg-yellow-600", "text-slate-100");
  tab3Btn.classList.add("hover:bg-yellow-50");
});

tab3Btn.addEventListener("click", () => {
  tab3.classList.remove("hidden");
  tab1.classList.add("hidden");
  tab2.classList.add("hidden");

  tab3Btn.classList.add("bg-yellow-600", "text-slate-100");
  tab3Btn.classList.remove("hover:bg-yellow-50");
  tab1Btn.classList.remove("bg-red-600", "text-slate-100");
  tab1Btn.classList.add("hover:bg-red-50");
  tab2Btn.classList.remove("bg-blue-600", "text-slate-100");
  tab2Btn.classList.add("hover:bg-blue-50");
});
