// جایگزین <YOUR_RAILWAY_PROJECT_URL> با URL واقعی بعد از deploy
const apiUrl = "https://<YOUR_RAILWAY_PROJECT_URL>/status";

let cpuChart, ramChart;

async function fetchServers() {
  try {
    const res = await fetch(apiUrl);
    const servers = await res.json();
    displayServers(servers);
    updateCharts(servers);
  } catch (err) {
    console.error("Error fetching servers:", err);
  }
}

function displayServers(servers) {
  const container = document.getElementById("servers");
  container.innerHTML = "";
  servers.forEach((server) => {
    const div = document.createElement("div");
    div.className = "server " + (server.status === "up" ? "up" : "down");
    div.innerHTML = `
      <h2>${server.name}</h2>
      <p>IP: ${server.ip}</p>
      <p>Status: ${server.status}</p>
      <p>Latency: ${server.latency ?? "N/A"} ms</p>
      <p>CPU: ${server.cpu ?? "N/A"}%</p>
      <p>RAM: ${server.ram ?? "N/A"}%</p>
    `;
    container.appendChild(div);
  });
}

function updateCharts(servers) {
  const cpuData = servers.map((s) => s.cpu ?? 0);
  const ramData = servers.map((s) => s.ram ?? 0);
  const labels = servers.map((s) => s.name);

  if (!cpuChart) {
    const ctxCPU = document.getElementById("chartCPU").getContext("2d");
    cpuChart = new Chart(ctxCPU, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "CPU %", data: cpuData, backgroundColor: "#00ffcc" },
        ],
      },
    });
  } else {
    cpuChart.data.datasets[0].data = cpuData;
    cpuChart.update();
  }

  if (!ramChart) {
    const ctxRAM = document.getElementById("chartRAM").getContext("2d");
    ramChart = new Chart(ctxRAM, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "RAM %", data: ramData, backgroundColor: "#ff6600" },
        ],
      },
    });
  } else {
    ramChart.data.datasets[0].data = ramData;
    ramChart.update();
  }
}

setInterval(fetchServers, 5000);
fetchServers();
