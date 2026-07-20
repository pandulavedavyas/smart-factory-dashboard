import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Datasets() {
  const { showToast } = useToast();
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { loadDatasets(); }, []);
  const loadDatasets = async () => { const data = await api.get('/datasets/list'); if (data) setDatasets(data); };

  const upload = async () => {
    if (!fileRef.current?.files?.length) return showToast('Select a file first', 'error');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    const data = await api.upload('/datasets/upload', fd);
    setUploading(false);
    if (data?.row_count) { showToast(`Uploaded: ${data.row_count} rows`); fileRef.current.value = ''; loadDatasets(); }
    else showToast(data?.error || 'Upload failed', 'error');
  };

  const deleteDS = async (id) => { if (!confirm('Delete?')) return; await api.del(`/datasets/${id}`); showToast('Deleted'); loadDatasets(); };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Datasets</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Upload, validate, and analyze manufacturing datasets</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <h3 className="text-sm font-bold text-white mb-4">Upload Dataset</h3>
        <div className="flex gap-3 items-center">
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="input flex-1" />
          <button onClick={upload} disabled={uploading} className="btn-primary whitespace-nowrap">
            {uploading ? <><i className="fas fa-spinner animate-spin mr-2" />Uploading...</> : <><i className="fas fa-upload mr-2" />Upload</>}
          </button>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Filename</th><th>Rows</th><th>Columns</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {datasets.length ? datasets.map(d => (
                <tr key={d.id}>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{d.id}</td>
                  <td className="font-medium text-white">{d.filename}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{d.rows}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{d.cols}</td>
                  <td><span className="status-badge status-running">{d.status}</span></td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{new Date(d.uploaded).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => deleteDS(d.id)} className="btn-danger text-xs !px-2 !py-1"><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              )) : <tr><td colSpan="7" className="text-center py-8" style={{ color: '#556677' }}>No datasets uploaded</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
