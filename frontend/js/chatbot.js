/* Chatbot Page */
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const messages = document.getElementById('chatMessages');
  messages.innerHTML += `<div class="chat-msg user fade-in"><div class="msg-bubble">${escapeHtml(msg)}</div></div>`;
  messages.scrollTop = messages.scrollHeight;

  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot fade-in';
  typingDiv.innerHTML = '<div class="chat-avatar" style="width:32px;height:32px;font-size:14px;flex-shrink:0"><i class="fas fa-robot"></i></div><div class="msg-bubble"><div class="loading-bar" style="width:80px"></div></div>';
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  try {
    const response = await API.post('/chatbot/message', { message: msg });
    typingDiv.remove();
    renderResponse(response);
  } catch(e) {
    typingDiv.remove();
    messages.innerHTML += `<div class="chat-msg bot"><div class="chat-avatar" style="width:32px;height:32px;font-size:14px;flex-shrink:0"><i class="fas fa-robot"></i></div><div class="msg-bubble" style="color:var(--accent-red)">Error: ${e.message}</div></div>`;
  }
  messages.scrollTop = messages.scrollHeight;
}

function renderResponse(response) {
  const messages = document.getElementById('chatMessages');
  const botDiv = document.createElement('div');
  botDiv.className = 'chat-msg bot fade-in';
  botDiv.innerHTML = '<div class="chat-avatar" style="width:32px;height:32px;font-size:14px;flex-shrink:0"><i class="fas fa-robot"></i></div>';

  if (response.type === 'text') {
    botDiv.innerHTML += `<div class="msg-bubble">${response.content}</div>`;
  } else if (response.type === 'bar' || response.type === 'line' || response.type === 'pie') {
    const chartId = 'chat_chart_' + Date.now();
    botDiv.innerHTML += `<div class="msg-bubble"><strong>${response.title || ''}</strong><div class="chart-in-chat"><canvas id="${chartId}" style="height:200px"></canvas></div></div>`;
    messages.appendChild(botDiv);
    setTimeout(() => {
      const ctx = document.getElementById(chartId);
      if (!ctx) return;
      new Chart(ctx, {
        type: response.type === 'bar' ? 'bar' : response.type === 'line' ? 'line' : 'pie',
        data: {
          labels: response.labels || [],
          datasets: [{
            data: response.values || [],
            backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'],
            borderColor: '#3b82f6',
            borderWidth: response.type === 'line' ? 2 : 0,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: response.type === 'pie', position: 'bottom', labels: { color: '#8892a6' } } } }
      });
    }, 50);
    return;
  } else if (response.type === 'radar' && response.datasets) {
    const chartId = 'chat_radar_' + Date.now();
    botDiv.innerHTML += `<div class="msg-bubble"><strong>${response.title || ''}</strong><div class="chart-in-chat"><canvas id="${chartId}" style="height:250px"></canvas></div></div>`;
    messages.appendChild(botDiv);
    setTimeout(() => {
      const ctx = document.getElementById(chartId);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'radar',
        data: { labels: response.labels, datasets: response.datasets.map(d => ({ label: d.label, data: d.values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', pointBackgroundColor: '#3b82f6' })) },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: '#1e293b' }, ticks: { display: false } } } }
      });
    }, 50);
    return;
  }

  messages.appendChild(botDiv);
}

async function loadSuggestions() {
  try {
    const data = await API.get('/chatbot/suggestions');
    const container = document.getElementById('suggestionChips');
    if (!container) return;
    container.innerHTML = data.slice(0, 4).map(s =>
      `<button class="btn btn-secondary btn-sm" onclick="document.getElementById('chatInput').value=this.textContent;sendMessage()">${s}</button>`
    ).join('');
  } catch(e) {}
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadSuggestions);