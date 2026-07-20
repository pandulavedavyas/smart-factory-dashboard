/* Datasets Page */
async function loadDatasets() {
  try {
    const data = await API.get('/datasets/list');
    const tbody = document.getElementById('datasetTable');
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="color:var(--text-muted)">No datasets uploaded yet</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(d => `
      <tr><td>${d.id}</td><td>${d.filename}</td><td>${d.rows}</td><td>${d.cols}</td>
      <td><span class="status-badge ${d.status === 'processed' ? 'running' : 'idle'}">${d.status}</span></td>
      <td>${new Date(d.uploaded).toLocaleDateString()}</td>
      <td><button class="btn btn-secondary btn-sm" onclick="previewDataset(${d.id})"><i class="fas fa-eye"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteDataset(${d.id})"><i class="fas fa-trash"></i></button></td></tr>
    `).join('');
  } catch(e) { showToast('Failed to load datasets', 'error'); }
}

async function uploadDataset() {
  const input = document.getElementById('fileInput');
  if (!input.files.length) return showToast('Select a file first', 'error');
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);
  document.getElementById('uploadProgress').style.display = 'block';
  try {
    const res = await fetch('/api/datasets/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`Dataset uploaded: ${data.row_count} rows, ${data.column_count} columns`);
    document.getElementById('uploadModal').classList.remove('show');
    document.getElementById('uploadProgress').style.display = 'none';
    loadDatasets();
  } catch(e) { showToast(e.message || 'Upload failed', 'error'); document.getElementById('uploadProgress').style.display = 'none'; }
}

async function previewDataset(id) {
  try {
    const data = await API.get(`/datasets/${id}/preview`);
    const table = document.getElementById('previewTable');
    table.querySelector('thead').innerHTML = '<tr>' + data.columns.map(c => `<th>${c}</th>`).join('') + '</tr>';
    table.querySelector('tbody').innerHTML = data.preview.slice(0, 10).map(r =>
      '<tr>' + data.columns.map(c => `<td>${r[c] !== null && r[c] !== undefined ? r[c] : ''}</td>`).join('') + '</tr>'
    ).join('');
    document.getElementById('previewModal').classList.add('show');
  } catch(e) { showToast('Failed to load preview', 'error'); }
}

async function deleteDataset(id) {
  if (!confirm('Delete this dataset?')) return;
  try {
    await API.del(`/datasets/${id}`);
    showToast('Dataset deleted');
    loadDatasets();
  } catch(e) { showToast('Failed to delete', 'error'); }
}

document.addEventListener('DOMContentLoaded', loadDatasets);