/* Reports Page */
async function loadReports() {
  try {
    const data = await API.get('/reports/list');
    const tbody = document.getElementById('reportsTable');
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--text-muted)">No reports generated yet</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => `
      <tr><td><span class="status-badge running">${r.type}</span></td><td>${r.title}</td><td>${r.format}</td>
      <td>${new Date(r.created_at).toLocaleDateString()}</td>
      <td><a href="/api/reports/download/${r.file}" class="btn btn-secondary btn-sm"><i class="fas fa-download"></i></a></td></tr>
    `).join('');
  } catch(e) { showToast('Failed to load reports', 'error'); }
}

async function generateReport() {
  const type = document.getElementById('reportType').value;
  try {
    const data = await API.post('/reports/generate', { type });
    showToast('Report generated: ' + data.filename);
    loadReports();
  } catch(e) { showToast('Failed to generate report', 'error'); }
}

async function exportCSV() {
  try {
    const data = await API.get('/reports/export/csv');
    showToast('CSV exported: ' + data.filename);
  } catch(e) { showToast('Failed to export', 'error'); }
}

document.addEventListener('DOMContentLoaded', loadReports);