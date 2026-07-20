import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReports, saveReport, getWorkers, getMachines, getProduction } from '../services/firestoreService';
import { useToast } from '../context/ToastContext';

export default function Reports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('Daily');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Preview / Export states
  const [previewReport, setPreviewReport] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    loadReportsData();
  }, []);

  async function loadReportsData() {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data.sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated)));
    } catch (err) {
      showToast('Error syncing reports registry', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate hardware compiling
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const randId = 'rep-' + Math.random().toString(36).substr(2, 5);
      const name = `${reportType} Operations Audit [${today}]`;
      
      const newReport = {
        id: randId,
        name: name,
        type: reportType,
        dateCreated: today,
        status: 'Generated'
      };

      await saveReport(newReport);
      showToast(`${reportType} Report generated successfully!`);
      loadReportsData();
    } catch (err) {
      showToast('Report compilation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Compile datasets for download
  const getCompiledData = async (type) => {
    const workers = await getWorkers();
    const machines = await getMachines();
    const production = await getProduction();
    const today = new Date().toISOString().slice(0, 10);

    let headers = [];
    let rows = [];

    switch (type) {
      case 'Worker':
        headers = ['Employee ID', 'Name', 'Department', 'Zone', 'Assigned Machine', 'Shift', 'Status', 'Attendance (%)', 'Hours Logged'];
        rows = workers.map(w => [w.employeeId, w.name, w.department, w.zone, w.assignedMachine, w.shift, w.status, w.attendance, w.workingHours]);
        break;
      case 'Machine':
        headers = ['Machine Name', 'Machine ID', 'Zone', 'Temperature (°C)', 'Status', 'Health (%)', 'Hours Logged', 'Assigned Operator'];
        rows = machines.map(m => [m.machineName, m.machineId, m.zone, m.temperature, m.status, m.health, m.workingHours, m.assignedOperator]);
        break;
      case 'Attendance':
        headers = ['Employee ID', 'Name', 'Department', 'Shift', 'Attendance Rate (%)', 'Working Hours', 'Presence Status'];
        rows = workers.map(w => [w.employeeId, w.name, w.department, w.shift, w.attendance, w.workingHours, w.status]);
        break;
      case 'Production':
        headers = ['Prod ID', 'Date Logged', 'Quantity (units)', 'Shift', 'Machine ID', 'Scrap Quantity', 'Efficiency Rate (%)'];
        rows = production.map(p => [p.id, p.date, p.quantity, p.shift, p.machineId, p.scrapQty, p.efficiency]);
        break;
      case 'Daily':
      case 'Weekly':
      case 'Monthly':
      default:
        headers = ['Operational Parameter', 'Current Metrices', 'Target Benchmarks', 'Status Allocation'];
        rows = [
          ['Total Factory Output', `${production.reduce((s,c)=>s+c.quantity, 0)} units`, '10000 units', 'Operational'],
          ['Average Machine Health', `${(machines.reduce((s,c)=>s+c.health, 0)/machines.length).toFixed(1)}%`, '85.0%', 'Optimal'],
          ['Workforce Attendance Rate', `${(workers.reduce((s,c)=>s+w.attendance, 0)/workers.length).toFixed(1)}%`, '95.0%', 'Optimal'],
          ['Active Machinery Count', `${machines.filter(m=>m.status==='Running').length} units`, `${machines.length} units`, 'Good'],
          ['Downtime Incidents', `${machines.filter(m=>m.status==='Maintenance').length} alert`, '0 alerts', 'Critical']
        ];
        break;
    }

    return { headers, rows };
  };

  // CSV Exporter
  const downloadCSV = async (type, filename) => {
    const { headers, rows } = await getCompiledData(type);
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully');
  };

  // Excel Exporter
  const downloadExcel = async (type, filename) => {
    const { headers, rows } = await getCompiledData(type);
    
    // Create Excel friendly XML format
    let xmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>
        <table border="1px">
          <thead>
            <tr style="background-color: #0066FF; color: #FFFFFF; font-weight: bold;">
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel document exported');
  };

  // PDF / Print Exporter
  const printPDF = async (type, filename) => {
    const { headers, rows } = await getCompiledData(type);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc; color: #333; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #0066ff; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #071A2F; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0 0 0; color: #556677; font-size: 12px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; background-color: #ffffff; margin-top: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            th { background-color: #071A2F; color: #ffffff; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e1e7f0; font-size: 11px; }
            tr:nth-child(even) { background-color: #fcfdfe; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #8899aa; border-top: 1px solid #e1e7f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AI Smart Factory Technology</h1>
            <p>${filename} · Official System Log</p>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            Generated automatically via Smart Factory Industry 4.0 Platform. Confidential document for internal use only.
          </div>
          <script>
            window.onload = function() {
              window.print();
              // window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast('Report layout compiled, print trigger active');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Operational Report Center</h1>
        <p className="text-xs" style={{ color: '#8899AA' }}>Generate status ledgers for machinery performance, logs, and workforce audits.</p>
      </motion.div>

      {/* Compiler Action Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="glass-card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 102, 255, 0.12)', border: '1px solid rgba(0, 102, 255, 0.2)' }}>
              <i className="fas fa-file-invoice text-xs text-[#0066FF]" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Compile New Ledger</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Select Category</label>
              <select 
                className="input text-xs" 
                value={reportType} 
                onChange={e => setReportType(e.target.value)}
              >
                <option value="Daily">Daily Report</option>
                <option value="Weekly">Weekly Report</option>
                <option value="Monthly">Monthly Report</option>
                <option value="Machine">Machine Report</option>
                <option value="Worker">Worker Report</option>
                <option value="Attendance">Attendance Report</option>
                <option value="Production">Production Report</option>
              </select>
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={generating} 
              className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-extrabold flex justify-center items-center gap-2"
            >
              {generating ? (
                <>
                  <i className="fas fa-cog fa-spin text-sm" />
                  <span>Compiling floor metrics...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-file-circle-check text-sm" />
                  <span>Compile Audit Report</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Quick export widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="glass-card-premium p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 214, 143, 0.12)', border: '1px solid rgba(0, 214, 143, 0.2)' }}>
              <i className="fas fa-file-csv text-xs text-[#00D68F]" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Fast Export Engine</span>
          </div>
          <div className="text-center py-4">
            <h4 className="text-sm font-bold text-white">Full Database Backup</h4>
            <p className="text-[10px] max-w-xs mx-auto mt-1" style={{ color: '#556677' }}>
              Instantly fetch and download the complete machinery telemetry database as a structured CSV document.
            </p>
          </div>
          <button 
            onClick={() => downloadCSV('Machine', 'Full_Factory_Machinery_Backup')} 
            className="btn-secondary py-3 text-xs uppercase tracking-wider font-bold w-full"
          >
            <i className="fas fa-download mr-2" /> Download Telemetry CSV
          </button>
        </motion.div>
      </div>

      {/* Reports Table List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }} 
        className="glass-card-premium p-1"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
            <span className="text-xs" style={{ color: '#8899AA' }}>Syncing reports database...</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Ledger Name</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-right">Export Formats</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.01]">
                    <td>
                      <span className="status-badge status-in_progress">
                        {r.type}
                      </span>
                    </td>
                    <td className="text-xs font-bold text-white">{r.name}</td>
                    <td>
                      <span className="text-[10px] font-bold text-[#00D68F] uppercase tracking-wider">
                        🟢 Active
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{r.dateCreated}</td>
                    <td className="text-right py-2 px-4">
                      <div className="inline-flex items-center gap-2">
                        {/* CSV */}
                        <button 
                          onClick={() => downloadCSV(r.type, r.name)}
                          className="btn-secondary !px-2.5 !py-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-[#00E5FF] flex items-center gap-1"
                          title="Download CSV"
                        >
                          <i className="fas fa-file-csv text-xs text-[#00D68F]" /> CSV
                        </button>
                        {/* Excel */}
                        <button 
                          onClick={() => downloadExcel(r.type, r.name)}
                          className="btn-secondary !px-2.5 !py-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-[#00E5FF] flex items-center gap-1"
                          title="Export Excel"
                        >
                          <i className="fas fa-file-excel text-xs text-[#00D68F]" /> Excel
                        </button>
                        {/* PDF */}
                        <button 
                          onClick={() => printPDF(r.type, r.name)}
                          className="btn-secondary !px-2.5 !py-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-[#00E5FF] flex items-center gap-1"
                          title="Print PDF"
                        >
                          <i className="fas fa-file-pdf text-xs text-[#FF4757]" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
