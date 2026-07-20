/* Analytics Page */
let charts = {};

async function loadDatasets() {
  try {
    const data = await API.get('/datasets/list');
    const sel = document.getElementById('datasetSelect');
    sel.innerHTML = '<option value="">Select Dataset</option>' + data.map(d => `<option value="${d.id}">${d.filename} (${d.rows} rows)</option>`).join('');
  } catch(e) {}
}

async function loadEDA() {
  const id = document.getElementById('datasetSelect').value;
  if (!id) return showToast('Select a dataset first', 'error');
  try {
    const data = await API.get(`/analytics/eda/${id}`);
    renderSummary(data);
    renderCorrelation(data);
    renderDistributions(data);
    renderInsights();
  } catch(e) { showToast('EDA failed: ' + e.message, 'error'); }
}

function renderSummary(data) {
  const container = document.getElementById('summaryStats');
  if (!container) return;
  const items = [
    { label: 'Rows', value: data.shape[0] },
    { label: 'Columns', value: data.shape[1] },
    { label: 'Numeric', value: data.numeric_columns.length },
    { label: 'Categorical', value: data.categorical_columns.length },
  ];
  container.innerHTML = items.map(item => `
    <div class="kpi-card"><div class="kpi-label">${item.label}</div><div class="kpi-value">${item.value}</div></div>
  `).join('');
}

function renderCorrelation(data) {
  const canvas = document.getElementById('correlationChart');
  if (!canvas || !data.correlation) return;
  if (charts.corr) charts.corr.destroy();
  const keys = Object.keys(data.correlation);
  const values = keys.map(k => keys.map(k2 => data.correlation[k][k2] || 0));
  charts.corr = new Chart(canvas, {
    type: 'matrix',
    data: { datasets: [{ label: 'Correlation', data: values.flatMap((row, i) => row.map((v, j) => ({ x: j, y: i, v }))), backgroundColor(ctx) { const v = ctx.dataset.data[ctx.dataIndex].v; return v > 0.5 ? '#10b981' : v > 0 ? '#3b82f6' : v > -0.5 ? '#f59e0b' : '#ef4444'; } }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { callback(i) { return keys[i]; } } }, y: { ticks: { callback(i) { return keys[i]; } } } } }
  });
}

function renderDistributions(data) {
  const container = document.getElementById('distContainer');
  if (!container) return;
  container.innerHTML = '';
  data.numeric_columns.slice(0, 4).forEach(col => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<div class="card-header"><span class="card-title">${col}</span></div><div class="chart-container-sm"><canvas id="dist_${col}"></canvas></div>`;
    container.appendChild(div);
    setTimeout(() => {
      const ctx = document.getElementById(`dist_${col}`);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: col, data: [], backgroundColor: '#3b82f6' }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }, 100);
  });
}

async function renderInsights() {
  try {
    const data = await API.get('/analytics/insights');
    const container = document.getElementById('insightsContainer');
    if (!container) return;
    container.innerHTML = '<div class="card-header"><span class="card-title">AI-Powered Insights (' + data.count + ')</span></div>' +
      data.insights.map(i => `
        <div class="d-flex gap-3 align-center" style="padding:12px 0;border-bottom:1px solid var(--border-color)">
          <i class="fas fa-${i.icon}" style="font-size:20px;color:${i.type === 'critical' ? '#ef4444' : i.type === 'warning' ? '#f59e0b' : '#10b981'}"></i>
          <div><strong>${i.title}</strong><br><small style="color:var(--text-muted)">${i.description}</small></div>
        </div>
      `).join('');
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  loadDatasets();
  renderInsights();
});