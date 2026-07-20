/* Shared Chart Utilities */
function createChart(canvasId, type, data, options) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, { type, data, options: { responsive: true, maintainAspectRatio: false, ...options } });
}