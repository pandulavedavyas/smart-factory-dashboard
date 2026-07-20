/* Dashboard Page */
let charts = {};

async function loadDashboard() {
  try {
    const data = await API.get('/dashboard/kpi');
    renderKPIs(data);
    renderHealthChart(data);
    renderProductionChart(data);
    renderStatusChart(data);
    renderFailureChart(data);
    renderPredictions(data.recent_predictions || []);
  } catch(e) { showToast('Failed to load dashboard', 'error'); }
}

function renderKPIs(data) {
  const grid = document.getElementById('kpiGrid');
  const items = [
    { icon: 'fa-industry', label: 'Total Machines', value: data.total_machines, color: '#3b82f6', change: `${data.machines.running} running` },
    { icon: 'fa-chart-bar', label: 'Production Output', value: (data.production_output || 0).toLocaleString(), color: '#10b981', change: 'Units' },
    { icon: 'fa-heartbeat', label: 'Avg Health Score', value: data.avg_health_score + '%', color: '#06b6d4', change: data.machines.down + ' down' },
    { icon: 'fa-thermometer-half', label: 'Avg Temperature', value: data.avg_temperature + '°C', color: '#f59e0b', change: 'Across all machines' },
    { icon: 'fa-exclamation-triangle', label: 'Machine Failures', value: data.machine_failures, color: '#ef4444', change: data.failure_rate + '% rate' },
    { icon: 'fa-tachometer-alt', label: 'Avg Torque', value: data.avg_torque + ' Nm', color: '#8b5cf6', change: 'Production metric' },
    { icon: 'fa-cogs', label: 'Tool Wear', value: data.avg_tool_wear, color: '#f97316', change: 'Avg across machines' },
    { icon: 'fa-check-circle', label: 'Prediction Accuracy', value: data.prediction_accuracy + '%', color: '#10b981', change: 'Model confidence' },
  ];
  grid.innerHTML = items.map(item => `
    <div class="kpi-card fade-in">
      <div class="kpi-icon" style="background:${item.color}20;color:${item.color}"><i class="fas ${item.icon}"></i></div>
      <div class="kpi-label">${item.label}</div>
      <div class="kpi-value">${item.value}</div>
      <div class="kpi-change up">${item.change}</div>
    </div>
  `).join('');
}

function renderHealthChart(data) {
  const ctx = document.getElementById('healthChart');
  if (!ctx) return;
  if (charts.health) charts.health.destroy();
  const labels = data.machine_health_labels || ['CNC-001','CNC-002','PRS-001','PRS-002','WLD-001','ASM-001','PKG-001','LSR-001'];
  const values = data.machine_health_values || [92,88,78,45,85,96,93,90];
  charts.health = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ label: 'Health Score', data: values, backgroundColor: values.map(v => v > 80 ? '#10b981' : v > 60 ? '#f59e0b' : '#ef4444'), borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100, grid: { color: '#1e293b' } }, x: { grid: { display: false } } } }
  });
}

function renderProductionChart(data) {
  const ctx = document.getElementById('productionChart');
  if (!ctx) return;
  if (charts.production) charts.production.destroy();
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const values = data.trend_values || [850,920,1080,1150,980,1050,1200];
  charts.production = new Chart(ctx, {
    type: 'line', data: { labels, datasets: [{ label: 'Production', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: '#1e293b' } }, x: { grid: { display: false } } } }
  });
}

function renderStatusChart(data) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;
  if (charts.status) charts.status.destroy();
  const m = data.machines || { running: 6, idle: 1, down: 1, maintenance: 0 };
  charts.status = new Chart(ctx, {
    type: 'doughnut', data: { labels: ['Running','Idle','Down','Maintenance'], datasets: [{ data: [m.running,m.idle,m.down,m.maintenance], backgroundColor: ['#10b981','#f59e0b','#ef4444','#8b5cf6'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8892a6', padding: 12 } } },
      cutout: '65%' }
  });
}

function renderFailureChart(data) {
  const ctx = document.getElementById('failureChart');
  if (!ctx) return;
  if (charts.failure) charts.failure.destroy();
  const labels = ['CNC-001','CNC-002','PRS-001','PRS-002','WLD-001','ASM-001','PKG-001','LSR-001'];
  const values = [15,22,35,68,18,5,8,12];
  charts.failure = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ label: 'Failure Rate %', data: values, backgroundColor: values.map(v => v > 50 ? '#ef4444' : v > 20 ? '#f59e0b' : '#10b981'), borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100, grid: { color: '#1e293b' } }, x: { grid: { display: false } } } }
  });
}

function renderPredictions(preds) {
  const tbody = document.getElementById('predictionTable');
  if (!tbody) return;
  if (!preds || preds.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--text-muted)">No predictions yet</td></tr>';
    return;
  }
  tbody.innerHTML = preds.map(p => `
    <tr><td>${p.machine || 'N/A'}</td><td>${p.type || 'failure'}</td><td>${p.value || 0}</td>
    <td><span class="status-badge ${p.confidence > 80 ? 'running' : 'idle'}">${p.confidence || 0}%</span></td>
    <td>${p.time || ''}</td></tr>
  `).join('');
}

function refreshDashboard() { loadDashboard(); }

document.addEventListener('DOMContentLoaded', loadDashboard);