"""Generate all frontend HTML pages and JS modules."""
import os

ROOT = r'C:\Users\DELL\OneDrive\Desktop\smart factory monitoring'

def ensure(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def write(path, content):
    ensure(path)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  {os.path.relpath(path, ROOT)}")

def main():
    base = ROOT
    
    # ── Shared template fragments ──
    SIDEBAR = '''<div class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon"><i class="fas fa-industry"></i></div>
    <div><h2>Smart Factory</h2><small>AI Analytics Platform</small></div>
  </div>
  <div class="sidebar-nav">
    <div class="sidebar-section">Main</div>
    <a href="/dashboard" class="nav-item" data-page="dashboard"><i class="fas fa-th-large"></i>Dashboard</a>
    <a href="/datasets" class="nav-item" data-page="datasets"><i class="fas fa-database"></i>Datasets</a>
    <a href="/analytics" class="nav-item" data-page="analytics"><i class="fas fa-chart-line"></i>Analytics</a>
    <a href="/ml" class="nav-item" data-page="ml"><i class="fas fa-brain"></i>ML Models</a>
    <div class="sidebar-section">Insights</div>
    <a href="/chatbot" class="nav-item" data-page="chatbot"><i class="fas fa-robot"></i>AI Chatbot</a>
    <a href="/reports" class="nav-item" data-page="reports"><i class="fas fa-file-alt"></i>Reports</a>
    <div class="sidebar-section">System</div>
    <a href="/settings" class="nav-item" data-page="settings"><i class="fas fa-cog"></i>Settings</a>
  </div>
</div>'''

    TOPBAR = '''<div class="topbar">
  <button class="topbar-btn d-md-none" onclick="document.getElementById('sidebar').classList.toggle('open')"><i class="fas fa-bars"></i></button>
  <div class="topbar-search"><i class="fas fa-search" style="color:var(--text-muted);font-size:13px"></i><input type="text" placeholder="Search machines, datasets, reports..." id="globalSearch"></div>
  <div class="topbar-actions">
    <button class="topbar-btn" onclick="toggleTheme()"><i class="fas fa-moon" id="themeIcon"></i></button>
    <button class="topbar-btn" onclick="window.location.href='/chatbot'"><i class="fas fa-robot"></i></button>
    <button class="topbar-btn"><i class="fas fa-bell"></i><span class="dot" style="background:var(--accent-red)"></span></button>
    <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff&size=36" class="avatar" alt="User">
  </div>
</div>'''

    FOOTER = '''<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="/static/js/api.js"></script>
<script src="/static/js/app.js"></script>'''

    # ── Dashboard HTML ──
    dashboard = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dashboard - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body>
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content">
  <div class="page-header"><div><h1><span class="gradient-text">Dashboard</span></h1><p class="breadcrumb"><a href="/">Home</a> / Dashboard</p></div>
    <div class="d-flex gap-3"><button class="btn btn-secondary btn-sm" onclick="refreshDashboard()"><i class="fas fa-sync"></i>Refresh</button><button class="btn btn-primary btn-sm" onclick="window.location.href='/datasets'"><i class="fas fa-upload"></i>Upload Dataset</button></div>
  </div>
  <div id="kpiGrid" class="grid grid-4 mb-4"></div>
  <div class="grid grid-2 mb-4">
    <div class="card"><div class="card-header"><span class="card-title">Machine Health Overview</span><span class="status-badge running" id="machineCount">--</span></div><div class="chart-container-sm"><canvas id="healthChart"></canvas></div></div>
    <div class="card"><div class="card-header"><span class="card-title">Production Trend</span><span class="card-title" style="font-size:12px">Last 7 days</span></div><div class="chart-container-sm"><canvas id="productionChart"></canvas></div></div>
  </div>
  <div class="grid grid-2 mb-4">
    <div class="card"><div class="card-header"><span class="card-title">Machine Status Distribution</span></div><div class="chart-container-sm"><canvas id="statusChart"></canvas></div></div>
    <div class="card"><div class="card-header"><span class="card-title">Failure Rate by Machine</span></div><div class="chart-container-sm"><canvas id="failureChart"></canvas></div></div>
  </div>
  <div class="card"><div class="card-header"><span class="card-title">Recent Predictions</span></div>
    <div class="table-container"><table><thead><tr><th>Machine</th><th>Type</th><th>Value</th><th>Confidence</th><th>Time</th></tr></thead><tbody id="predictionTable"><tr><td colspan="5" class="text-center" style="color:var(--text-muted)"><div class="loading-bar" style="margin:10px 0"></div>Loading...</td></tr></tbody></table></div>
  </div>
</div></div>
<script>const PAGE="dashboard";</script>
{FOOTER}
<script src="/static/js/dashboard.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'dashboard.html'), dashboard)

    # ── Datasets HTML ──
    datasets = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Datasets - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body>
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content">
  <div class="page-header"><div><h1><span class="gradient-text">Datasets</span></h1><p class="breadcrumb"><a href="/">Home</a> / Datasets</p></div>
    <button class="btn btn-primary" onclick="document.getElementById('uploadModal').classList.add('show')"><i class="fas fa-upload"></i>Upload CSV</button>
  </div>
  <div id="uploadModal" class="modal-backdrop"><div class="modal">
    <div class="modal-header"><h3>Upload Manufacturing Dataset</h3><button class="modal-close" onclick="this.closest('.modal-backdrop').classList.remove('show')"><i class="fas fa-times"></i></button></div>
    <div class="form-group"><label class="form-label">CSV or Excel File</label>
      <input type="file" class="form-control" accept=".csv,.xlsx,.xls" id="fileInput"></div>
    <div id="uploadProgress" class="loading-bar mb-3" style="display:none"></div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="document.getElementById('uploadModal').classList.remove('show')">Cancel</button>
      <button class="btn btn-primary" onclick="uploadDataset()"><i class="fas fa-cloud-upload-alt"></i>Upload & Process</button></div>
  </div></div>
  <div class="card">
    <div class="card-header"><span class="card-title">Uploaded Datasets</span></div>
    <div class="table-container"><table><thead><tr><th>ID</th><th>Filename</th><th>Rows</th><th>Columns</th><th>Status</th><th>Uploaded</th><th>Actions</th></tr></thead><tbody id="datasetTable"><tr><td colspan="7" class="text-center"><div class="loading-bar" style="margin:10px 0"></div>Loading...</td></tr></tbody></table></div>
  </div>
</div></div>
<div id="previewModal" class="modal-backdrop"><div class="modal" style="max-width:90%"><div class="modal-header"><h3>Dataset Preview</h3><button class="modal-close" onclick="this.closest('.modal-backdrop').classList.remove('show')"><i class="fas fa-times"></i></button></div>
  <div class="table-container"><table id="previewTable"><thead></thead><tbody></tbody></table></div>
</div></div>
<script>const PAGE="datasets";</script>
{FOOTER}
<script src="/static/js/datasets.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'datasets.html'), datasets)

    # ── Analytics HTML ──
    analytics = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Analytics - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body>
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content">
  <div class="page-header"><div><h1><span class="gradient-text">Analytics & EDA</span></h1><p class="breadcrumb"><a href="/">Home</a> / Analytics</p></div>
    <div class="d-flex gap-3"><select class="form-control" style="width:200px" id="datasetSelect"><option value="">Select Dataset</option></select>
    <button class="btn btn-primary btn-sm" onclick="loadEDA()"><i class="fas fa-sync"></i>Analyze</button></div>
  </div>
  <div class="tabs"><button class="tab-btn active" data-tab="overview">Overview</button><button class="tab-btn" data-tab="correlation">Correlation</button><button class="tab-btn" data-tab="distributions">Distributions</button><button class="tab-btn" data-tab="insights">AI Insights</button></div>
  <div id="tab-overview" class="tab-content"><div class="card"><div id="summaryStats" class="grid grid-4"></div></div></div>
  <div id="tab-correlation" class="tab-content" style="display:none"><div class="card"><div class="chart-container"><canvas id="correlationChart"></canvas></div></div></div>
  <div id="tab-distributions" class="tab-content" style="display:none"><div class="grid grid-2" id="distContainer"></div></div>
  <div id="tab-insights" class="tab-content" style="display:none"><div class="card"><div id="insightsContainer"><div class="loading-bar"></div></div></div></div>
</div></div>
<script>const PAGE="analytics";</script>
{FOOTER}
<script src="/static/js/analytics.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'analytics.html'), analytics)

    # ── ML HTML ──
    ml = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ML Models - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body>
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content">
  <div class="page-header"><div><h1><span class="gradient-text">Machine Learning</span></h1><p class="breadcrumb"><a href="/">Home</a> / ML Models</p></div></div>
  <div class="tabs"><button class="tab-btn active" data-tab="train">Train Model</button><button class="tab-btn" data-tab="predict">Predict</button><button class="tab-btn" data-tab="models">Saved Models</button></div>
  <div id="tab-train" class="tab-content">
    <div class="grid grid-2">
      <div class="card"><div class="card-header"><span class="card-title">Train Failure Prediction Model</span></div>
        <div class="form-group"><label class="form-label">Dataset (optional)</label><select class="form-control" id="trainDataset"><option value="">Use seed data</option></select></div>
        <div class="form-group"><label class="form-label">Target Column</label><input class="form-control" value="machine_failure" id="targetCol"></div>
        <button class="btn btn-primary w-100" onclick="trainModel('failure')"><i class="fas fa-brain"></i>Train Failure Model</button>
        <div id="trainResult" class="mt-4"></div>
      </div>
      <div class="card"><div class="card-header"><span class="card-title">Train Production Model</span></div>
        <div class="form-group"><label class="form-label">Target Column</label><input class="form-control" value="production_output" id="prodTargetCol"></div>
        <button class="btn btn-primary w-100" onclick="trainModel('production')"><i class="fas fa-chart-line"></i>Train Production Model</button>
        <div id="prodTrainResult" class="mt-4"></div>
      </div>
    </div>
  </div>
  <div id="tab-predict" class="tab-content" style="display:none">
    <div class="grid grid-2">
      <div class="card"><div class="card-header"><span class="card-title">Predict Machine Failure</span></div>
        <div class="form-group"><label class="form-label">Temperature</label><input class="form-control" value="70" id="predTemp"></div>
        <div class="form-group"><label class="form-label">Vibration</label><input class="form-control" value="1.2" id="predVib"></div>
        <div class="form-group"><label class="form-label">RPM</label><input class="form-control" value="2000" id="predRPM"></div>
        <div class="form-group"><label class="form-label">Torque</label><input class="form-control" value="40" id="predTorque"></div>
        <button class="btn btn-primary w-100" onclick="runPrediction()"><i class="fas fa-robot"></i>Predict</button>
        <div id="predResult" class="mt-4"></div>
      </div>
      <div class="card"><div class="card-header"><span class="card-title">Model Evaluation</span></div>
        <div class="chart-container-sm"><canvas id="confMatrixChart"></canvas></div>
      </div>
    </div>
  </div>
  <div id="tab-models" class="tab-content" style="display:none">
    <div class="card"><div class="card-header"><span class="card-title">Saved Models</span></div>
      <div class="table-container"><table><thead><tr><th>Name</th><th>Filename</th><th>Size</th><th>Status</th></tr></thead><tbody id="modelsTable"><tr><td colspan="4" class="text-center"><div class="loading-bar"></div></td></tr></tbody></table></div>
    </div>
  </div>
</div></div>
<script>const PAGE="ml";</script>
{FOOTER}
<script src="/static/js/ml.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'ml.html'), ml)

    # ── Chatbot HTML ──
    chatbot = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AI Chatbot - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body>
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content" style="padding-bottom:0">
  <div class="page-header"><div><h1><span class="gradient-text">AI Assistant</span></h1><p class="breadcrumb"><a href="/">Home</a> / AI Chatbot</p></div>
    <div class="d-flex gap-2" id="suggestionChips"></div>
  </div>
  <div class="chat-container">
    <div class="chat-header"><div class="chat-avatar"><i class="fas fa-robot"></i></div><div><strong>AI Manufacturing Assistant</strong><br><small style="color:var(--text-muted)">Powered by your dataset</small></div></div>
    <div class="chat-messages" id="chatMessages">
      <div class="chat-msg bot"><div class="chat-avatar" style="width:32px;height:32px;font-size:14px;flex-shrink:0"><i class="fas fa-robot"></i></div>
        <div class="msg-bubble">Hello! I'm your AI Manufacturing Assistant. Ask me about machines, production, failures, trends, or request charts. Try: <strong>"Show machine health"</strong> or <strong>"Which machine has the highest failure rate?"</strong></div></div>
    </div>
    <div class="chat-input">
      <input type="text" placeholder="Ask about your factory data..." id="chatInput" onkeydown="if(event.key==='Enter')sendMessage()">
      <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
    </div>
  </div>
</div></div>
<script>const PAGE="chatbot";</script>
{FOOTER}
<script src="/static/js/chatbot.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'chatbot.html'), chatbot)

    # ── Reports HTML ──
    reports = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Reports - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body>
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content">
  <div class="page-header"><div><h1><span class="gradient-text">Reports</span></h1><p class="breadcrumb"><a href="/">Home</a> / Reports</p></div>
    <div class="d-flex gap-3">
      <select class="form-control" style="width:160px" id="reportType"><option value="daily">Daily Report</option><option value="monthly">Monthly Report</option><option value="machine">Machine Report</option><option value="prediction">Prediction Report</option></select>
      <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-file-export"></i>Generate</button>
      <button class="btn btn-secondary" onclick="exportCSV()"><i class="fas fa-file-csv"></i>Export CSV</button>
    </div>
  </div>
  <div class="card"><div class="card-header"><span class="card-title">Generated Reports</span></div>
    <div class="table-container"><table><thead><tr><th>Type</th><th>Title</th><th>Format</th><th>Created</th><th>Actions</th></tr></thead><tbody id="reportsTable"><tr><td colspan="5" class="text-center"><div class="loading-bar"></div></td></tr></tbody></table></div>
  </div>
</div></div>
<script>const PAGE="reports";</script>
{FOOTER}
<script src="/static/js/reports.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'reports.html'), reports)

    # ── Settings HTML ──
    settings = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Settings - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body data-theme="dark">
{SIDEBAR}
<div class="main-content">
{TOPBAR}
<div class="page-content">
  <div class="page-header"><div><h1><span class="gradient-text">Settings</span></h1><p class="breadcrumb"><a href="/">Home</a> / Settings</p></div></div>
  <div class="tabs"><button class="tab-btn active" data-tab="profile">Profile</button><button class="tab-btn" data-tab="appearance">Appearance</button><button class="tab-btn" data-tab="notifications">Notifications</button></div>
  <div id="tab-profile" class="tab-content">
    <div class="card" style="max-width:600px"><div class="card-header"><span class="card-title">Profile Information</span></div>
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" id="settingsName" placeholder="Your name"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="settingsEmail" placeholder="email@company.com"></div>
      <div class="form-group"><label class="form-label">Department</label><input class="form-control" id="settingsDept" placeholder="Department"></div>
      <button class="btn btn-primary" onclick="saveProfile()"><i class="fas fa-save"></i>Save Changes</button>
    </div>
  </div>
  <div id="tab-appearance" class="tab-content" style="display:none">
    <div class="card" style="max-width:400px"><div class="card-header"><span class="card-title">Theme</span></div>
      <div class="d-flex gap-3"><button class="btn btn-secondary" onclick="setTheme('dark')"><i class="fas fa-moon"></i> Dark</button><button class="btn btn-secondary" onclick="setTheme('light')"><i class="fas fa-sun"></i> Light</button></div>
    </div>
  </div>
  <div id="tab-notifications" class="tab-content" style="display:none">
    <div class="card" style="max-width:400px"><div class="card-header"><span class="card-title">Notification Preferences</span></div>
      <div class="form-group"><label class="d-flex align-center gap-3"><input type="checkbox" checked id="notifEnabled"> Enable Notifications</label></div>
      <div class="form-group"><label class="d-flex align-center gap-3"><input type="checkbox" checked id="emailNotif"> Email Notifications</label></div>
    </div>
  </div>
</div></div>
<script>const PAGE="settings";</script>
{FOOTER}
<script src="/static/js/settings.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'settings.html'), settings)

    # ── Login HTML ──
    login = f'''<!DOCTYPE html><html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Login - AI Smart Factory</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/styles.css">
</head><body class="login-page">
<div class="login-bg"></div>
<div class="login-card">
  <div class="logo-area"><div class="logo-icon"><i class="fas fa-industry"></i></div><h1>AI Smart Factory</h1><p>Manufacturing Analytics Platform</p></div>
  <div class="login-tabs"><button class="login-tab active" onclick="switchLoginTab('login')">Sign In</button><button class="login-tab" onclick="switchLoginTab('register')">Register</button></div>
  <div class="login-form" id="loginForm">
    <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" placeholder="admin@factory.com" id="loginEmail"></div>
    <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-control" placeholder="••••••••" id="loginPassword"></div>
    <div class="d-flex align-center justify-between mb-4"><label class="d-flex align-center gap-2" style="font-size:13px;color:var(--text-muted)"><input type="checkbox" id="rememberMe"> Remember me</label><a href="#" style="font-size:13px" onclick="alert('Contact admin to reset password')">Forgot password?</a></div>
    <button class="btn btn-primary w-100 btn-lg" onclick="login()"><i class="fas fa-sign-in-alt"></i>Sign In</button>
  </div>
  <div class="login-form" id="registerForm" style="display:none">
    <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" placeholder="John Doe" id="regName"></div>
    <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" placeholder="new@factory.com" id="regEmail"></div>
    <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-control" placeholder="Create password" id="regPassword"></div>
    <button class="btn btn-primary w-100 btn-lg" onclick="register()"><i class="fas fa-user-plus"></i>Create Account</button>
  </div>
</div>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="/static/js/firebase-config.js"></script>
<script src="/static/js/auth.js"></script>
</body></html>'''
    write(os.path.join(base, 'frontend', 'templates', 'login.html'), login)

    print("All HTML templates written.")

    # ── CSS components ──
    css_vars = '''/* CSS Variables & Base */
:root[data-theme="dark"] {
  --bg-primary: #0a0e1a; --bg-secondary: #111827; --bg-card: #1a1f2e;
  --bg-card-hover: #1f2640; --bg-sidebar: #0d1117;
  --text-primary: #e4e8f1; --text-secondary: #8892a6; --text-muted: #5a6278;
  --accent-blue: #3b82f6; --accent-cyan: #06b6d4; --accent-purple: #8b5cf6;
  --accent-green: #10b981; --accent-yellow: #f59e0b; --accent-red: #ef4444;
  --accent-orange: #f97316;
  --border-color: #1e293b; --border-light: #2a3444;
  --shadow: 0 4px 20px rgba(0,0,0,0.3); --shadow-lg: 0 8px 40px rgba(0,0,0,0.4);
  --radius: 12px; --radius-sm: 8px; --radius-lg: 16px;
  --transition: 0.3s cubic-bezier(0.4,0,0.2,1);
}
[data-theme="light"] {
  --bg-primary: #f0f2f5; --bg-secondary: #ffffff; --bg-card: #ffffff;
  --bg-card-hover: #f8f9fa; --bg-sidebar: #ffffff;
  --text-primary: #1a1a2e; --text-secondary: #4a5568; --text-muted: #8892a6;
  --border-color: #e2e8f0; --border-light: #edf2f7;
  --shadow: 0 2px 10px rgba(0,0,0,0.08); --shadow-lg: 0 4px 20px rgba(0,0,0,0.1);
}'''
    write(os.path.join(base, 'frontend', 'css', 'variables.css'), css_vars)
    write(os.path.join(base, 'frontend', 'css', 'main.css'), '/* Main styles - consolidated in styles.css */')
    write(os.path.join(base, 'frontend', 'css', 'sidebar.css'), '/* Sidebar included in styles.css */')
    write(os.path.join(base, 'frontend', 'css', 'dashboard.css'), '/* Dashboard styles included in styles.css */')
    write(os.path.join(base, 'frontend', 'css', 'chatbot.css'), '/* Chatbot styles included in styles.css */')
    write(os.path.join(base, 'frontend', 'css', 'responsive.css'), '/* Responsive styles included in styles.css */')

    print("CSS files written.")

    # ── JS Modules ──
    api_js = '''/* API Client */
const API = {
  base: '/api',
  async request(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(this.base + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (e) { console.error('API Error:', e); throw e; }
  },
  get: (p) => API.request('GET', p),
  post: (p, b) => API.request('POST', p, b),
  put: (p, b) => API.request('PUT', p, b),
  del: (p) => API.request('DELETE', p),
};'''
    write(os.path.join(base, 'frontend', 'js', 'api.js'), api_js)

    app_js = '''/* App Core */
function toggleTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.getElementById('themeIcon').className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}

function showToast(msg, type = 'success') {
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;background:${colors[type]||colors.info};color:#fff;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:fadeIn 0.3s ease`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = saved === 'light' ? 'fas fa-sun' : 'fas fa-moon';
});'''
    write(os.path.join(base, 'frontend', 'js', 'app.js'), app_js)

    auth_js = '''/* Firebase Auth */
let firebaseInitialized = false;

function switchLoginTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.login-form').forEach(f => f.style.display = 'none');
  document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm').style.display = 'block';
  event.target.classList.add('active');
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return showToast('Please fill in all fields', 'error');
  try {
    showToast('Signing in...', 'info');
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    const token = await result.user.getIdToken();
    const data = await API.post('/auth/login', { id_token: token });
    showToast('Welcome back!');
    window.location.href = '/dashboard';
  } catch (e) { showToast(e.message || 'Login failed', 'error'); }
}

async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) return showToast('Please fill in all fields', 'error');
  try {
    showToast('Creating account...', 'info');
    const data = await API.post('/auth/register', { email, password, full_name: name });
    showToast('Account created! You can now sign in.');
    switchLoginTab('login');
  } catch (e) { showToast(e.message || 'Registration failed', 'error'); }
}

// Initialize Firebase if config exists
document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    firebaseInitialized = true;
  }
});'''
    write(os.path.join(base, 'frontend', 'js', 'auth.js'), auth_js)

    firebase_config = '''// Firebase Configuration - Replace with your project's values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
try { firebase.initializeApp(firebaseConfig); } catch(e) {}'''
    write(os.path.join(base, 'frontend', 'js', 'firebase-config.js'), firebase_config)

    dashboard_js = '''/* Dashboard Page */
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

document.addEventListener('DOMContentLoaded', loadDashboard);'''
    write(os.path.join(base, 'frontend', 'js', 'dashboard.js'), dashboard_js)

    datasets_js = '''/* Datasets Page */
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

document.addEventListener('DOMContentLoaded', loadDatasets);'''
    write(os.path.join(base, 'frontend', 'js', 'datasets.js'), datasets_js)

    analytics_js = '''/* Analytics Page */
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
});'''
    write(os.path.join(base, 'frontend', 'js', 'analytics.js'), analytics_js)

    ml_js = '''/* ML Models Page */
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

document.addEventListener('DOMContentLoaded', () => { loadDatasets(); loadModels(); });'''
    write(os.path.join(base, 'frontend', 'js', 'ml.js'), ml_js)

    chatbot_js = '''/* Chatbot Page */
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

document.addEventListener('DOMContentLoaded', loadSuggestions);'''
    write(os.path.join(base, 'frontend', 'js', 'chatbot.js'), chatbot_js)

    reports_js = '''/* Reports Page */
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

document.addEventListener('DOMContentLoaded', loadReports);'''
    write(os.path.join(base, 'frontend', 'js', 'reports.js'), reports_js)

    settings_js = '''/* Settings Page */
async function loadProfile() {
  try {
    const data = await API.get('/auth/profile');
    document.getElementById('settingsName').value = data.full_name || '';
    document.getElementById('settingsEmail').value = data.email || '';
    document.getElementById('settingsDept').value = data.department || '';
  } catch(e) {}
}

async function saveProfile() {
  try {
    await API.put('/auth/profile', {
      full_name: document.getElementById('settingsName').value,
      email: document.getElementById('settingsEmail').value,
      department: document.getElementById('settingsDept').value
    });
    showToast('Profile updated');
  } catch(e) { showToast('Failed to update', 'error'); }
}

document.addEventListener('DOMContentLoaded', loadProfile);'''
    write(os.path.join(base, 'frontend', 'js', 'settings.js'), settings_js)

    utils_js = '''/* Utility functions */
function formatNumber(n) { return n?.toLocaleString() || '0'; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ''; }
function formatTime(d) { return d ? new Date(d).toLocaleTimeString() : ''; }
function truncate(s, len = 50) { return s?.length > len ? s.substring(0, len) + '...' : s; }
function capitalize(s) { return s?.charAt(0).toUpperCase() + s?.slice(1); }'''
    write(os.path.join(base, 'frontend', 'js', 'utils.js'), utils_js)

    charts_js = '''/* Shared Chart Utilities */
function createChart(canvasId, type, data, options) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, { type, data, options: { responsive: true, maintainAspectRatio: false, ...options } });
}'''
    write(os.path.join(base, 'frontend', 'js', 'charts.js'), charts_js)

    print("All JS files written.")
    print(f"\n✅ Frontend generation complete. {18} files created.")

if __name__ == '__main__':
    main()
