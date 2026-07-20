/* ML Models Page */
async function trainModel(type) {
  const datasetId = document.getElementById('trainDataset')?.value;
  const targetCol = type === 'failure' ? document.getElementById('targetCol').value : document.getElementById('prodTargetCol').value;
  const resultDiv = type === 'failure' ? document.getElementById('trainResult') : document.getElementById('prodTrainResult');
  resultDiv.innerHTML = '<div class="loading-bar"></div>';
  try {
    const data = await API.post('/ml/train', { dataset_id: datasetId || null, target_col: targetCol, model_type: type });
    resultDiv.innerHTML = `
      <div class="card mt-3" style="background:var(--bg-secondary)">
        <h4 style="color:var(--accent-green)"><i class="fas fa-check-circle"></i> Training Complete</h4>
        <p>Accuracy: <strong>${data.accuracy || data.mae || 'N/A'}</strong></p>
        <p>Features: ${(data.features_used || []).join(', ')}</p>
        <p>Samples: ${data.test_samples || 'N/A'}</p>
        ${data.feature_importance ? '<p>Top Feature: ' + Object.entries(data.feature_importance)[0]?.join(': ') + '</p>' : ''}
      </div>`;
    showToast('Model trained successfully!');
  } catch(e) { resultDiv.innerHTML = `<p style="color:var(--accent-red)">Error: ${e.message}</p>`; }
}

async function runPrediction() {
  const features = {
    temperature: parseFloat(document.getElementById('predTemp').value) || 70,
    vibration: parseFloat(document.getElementById('predVib').value) || 1.2,
    rpm: parseFloat(document.getElementById('predRPM').value) || 2000,
    torque: parseFloat(document.getElementById('predTorque').value) || 40,
  };
  const resultDiv = document.getElementById('predResult');
  resultDiv.innerHTML = '<div class="loading-bar"></div>';
  try {
    const data = await API.post('/ml/predict', { features, type: 'failure' });
    const isFailure = data.prediction === 1 || data.fallback;
    resultDiv.innerHTML = `
      <div class="card mt-3" style="background:var(--bg-secondary);border-left:4px solid ${isFailure ? 'var(--accent-red)' : 'var(--accent-green)'}">
        <h4 style="color:${isFailure ? 'var(--accent-red)' : 'var(--accent-green)'}"><i class="fas fa-${isFailure ? 'exclamation-triangle' : 'check-circle'}"></i> ${isFailure ? 'Failure Predicted' : 'No Failure'}</h4>
        <p>Probability: <strong>${(data.probability * 100).toFixed(1)}%</strong></p>
        <p>Model: ${data.fallback ? 'Fallback (random)' : 'ML Model'}</p>
      </div>`;
  } catch(e) { resultDiv.innerHTML = `<p style="color:var(--accent-red)">Error: ${e.message}</p>`; }
}

async function loadModels() {
  try {
    const data = await API.get('/ml/models');
    const tbody = document.getElementById('modelsTable');
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color:var(--text-muted)">No models saved yet</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(m => `
      <tr><td><strong>${m.name}</strong></td><td>${m.filename}</td><td>${(m.size / 1024).toFixed(1)} KB</td>
      <td><span class="status-badge running">Available</span></td></tr>
    `).join('');
  } catch(e) {}
}

async function loadDatasets() {
  try {
    const data = await API.get('/datasets/list');
    const sel = document.getElementById('trainDataset');
    if (sel) sel.innerHTML = '<option value="">Use seed data</option>' + data.map(d => `<option value="${d.id}">${d.filename}</option>`).join('');
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => { loadDatasets(); loadModels(); });