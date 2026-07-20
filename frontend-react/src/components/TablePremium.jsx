import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TablePremium({
  title = 'Data Ledger',
  subtitle = '',
  columns = [],
  data = [],
  rowExpansionRenderer = null,
  defaultSortKey = '',
  filterOptions = null, // { key: 'category', options: ['Metals', 'Polymers', ...] }
}) {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey || (columns[0]?.key || ''));
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Column Selection (visibility)
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Row selection and expansion
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Handle Sort
  const handleSort = (key) => {
    const col = columns.find(c => c.key === key);
    if (col && col.sortable === false) return;

    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Toggle column visibility
  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Select/Deselect individual row
  const toggleRowSelection = (idx) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Master checkbox toggle
  const toggleSelectAll = (filteredRows) => {
    if (selectedRowIds.size === filteredRows.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredRows.map((_, idx) => idx)));
    }
  };

  // Toggle Row Expansion
  const toggleRowExpansion = (idx) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Filter, Search and Sort Logic
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Category Filtering
    if (filterOptions && selectedCategory !== 'all') {
      result = result.filter(item => {
        const val = item[filterOptions.key];
        return String(val).toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // 2. Global Text Search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(query)
        );
      });
    }

    // 3. Sorting
    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Handle numeric strings
        if (typeof valA === 'string' && valA.startsWith('$')) {
          valA = parseFloat(valA.replace(/[^0-9.-]/g, '')) || 0;
          valB = parseFloat(String(valB).replace(/[^0-9.-]/g, '')) || 0;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortKey, sortOrder, selectedCategory, filterOptions]);

  // Pagination calculations
  const totalRows = processedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  // Export Selected Rows (CSV format)
  const handleExportSelected = () => {
    if (selectedRowIds.size === 0) return;

    // Filter to get actual selected items
    const selectedItems = processedData.filter((_, idx) => selectedRowIds.has(idx));
    const activeCols = columns.filter(c => visibleColumns[c.key]);
    
    // Build CSV Content
    const csvRows = [];
    csvRows.push(activeCols.map(c => `"${c.label}"`).join(','));

    for (const item of selectedItems) {
      const values = activeCols.map(c => {
        const val = item[c.key];
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_selected.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export All Rows (CSV format)
  const handleExportAll = () => {
    const activeCols = columns.filter(c => visibleColumns[c.key]);
    const csvRows = [];
    csvRows.push(activeCols.map(c => `"${c.label}"`).join(','));

    for (const item of processedData) {
      const values = activeCols.map(c => {
        const val = item[c.key];
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_all.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card-premium rounded-2xl overflow-hidden border border-white/5" style={{ padding: '24px' }}>
      {/* Table Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-white font-semibold text-base">{title}</h3>
          {subtitle && <p className="text-[#8899AA] text-[11px] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Categorical filter */}
          {filterOptions && (
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#0066FF] transition-colors"
            >
              <option value="all" className="bg-[#0a1628] text-white">All Categories</option>
              {filterOptions.options.map(opt => (
                <option key={opt} value={opt} className="bg-[#0a1628] text-white">{opt}</option>
              ))}
            </select>
          )}

          {/* Column selection dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-table-columns text-[10px]" />
              Columns
            </button>
            
            <AnimatePresence>
              {showColumnDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowColumnDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0a1628]/95 border border-white/10 rounded-xl p-3 shadow-2xl z-20 backdrop-blur-md"
                  >
                    <p className="text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-2">Select Columns</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {columns.map(col => (
                        <label key={col.key} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={!!visibleColumns[col.key]}
                            onChange={() => toggleColumn(col.key)}
                            className="accent-[#0066FF] rounded border-white/10 bg-transparent"
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Export Action Controls */}
          {selectedRowIds.size > 0 ? (
            <motion.button
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleExportSelected}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00D68F]/20 text-[#00D68F] border border-[#00D68F]/30 hover:bg-[#00D68F]/30 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-file-export" />
              Export ({selectedRowIds.size}) Selected
            </motion.button>
          ) : (
            <button
              onClick={handleExportAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-download" />
              Export CSV
            </button>
          )}

          {/* Global Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search record..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white text-xs focus:outline-none focus:border-[#0066FF] transition-all w-48 xl:w-60"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03]">
              {/* Checkbox column */}
              <th className="px-4 py-3.5 w-10 text-center border-b border-white/10 sticky top-0 bg-[#071a2f]">
                <input
                  type="checkbox"
                  checked={processedData.length > 0 && selectedRowIds.size === processedData.length}
                  onChange={() => toggleSelectAll(processedData)}
                  className="accent-[#0066FF] rounded border-white/10 bg-transparent cursor-pointer"
                />
              </th>
              {/* Expansion toggle column */}
              {rowExpansionRenderer && (
                <th className="px-3 py-3.5 w-8 border-b border-white/10 sticky top-0 bg-[#071a2f]" />
              )}
              {/* Visible columns */}
              {columns.map(col => {
                if (!visibleColumns[col.key]) return null;
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider border-b border-white/10 sticky top-0 bg-[#071a2f] select-none ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-white/[0.03] hover:text-white' : ''
                    }`}
                    style={{ color: '#556677' }}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false && (
                        <span className="text-[9px] text-[#3b82f6]">
                          {isSorted ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => {
                const globalIndex = (currentPage - 1) * rowsPerPage + index;
                const isSelected = selectedRowIds.has(globalIndex);
                const isExpanded = expandedRowIds.has(globalIndex);

                return (
                  <React.Fragment key={globalIndex}>
                    <motion.tr
                      className={`group transition-colors duration-150 ${
                        isSelected ? 'bg-[#0066FF]/10 hover:bg-[#0066FF]/15' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Checkbox select cell */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(globalIndex)}
                          className="accent-[#0066FF] rounded border-white/10 bg-transparent cursor-pointer"
                        />
                      </td>

                      {/* Expand toggle cell */}
                      {rowExpansionRenderer && (
                        <td className="px-3 py-3.5 text-center">
                          <button
                            onClick={() => toggleRowExpansion(globalIndex)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <i className={`fa-solid ${isExpanded ? 'fa-angle-down' : 'fa-angle-right'} text-[11px]`} />
                          </button>
                        </td>
                      )}

                      {/* Columns */}
                      {columns.map(col => {
                        if (!visibleColumns[col.key]) return null;
                        const value = row[col.key];

                        return (
                          <td key={col.key} className="px-4 py-3.5 text-gray-300 font-medium whitespace-nowrap">
                            {col.render ? col.render(value, row) : String(value ?? '—')}
                          </td>
                        );
                      })}
                    </motion.tr>

                    {/* Row Expansion Render */}
                    {rowExpansionRenderer && isExpanded && (
                      <tr>
                        <td colSpan={columns.filter(c => visibleColumns[c.key]).length + (rowExpansionRenderer ? 2 : 1)} className="bg-white/[0.01] px-6 py-4 border-b border-white/10">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {rowExpansionRenderer(row)}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.filter(c => visibleColumns[c.key]).length + (rowExpansionRenderer ? 2 : 1)}
                  className="px-4 py-8 text-center text-[#8899AA] text-xs"
                >
                  <i className="fa-solid fa-folder-open text-lg mb-2 block opacity-40" />
                  No records match search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
        <div className="text-[11px] text-gray-400 font-medium">
          Showing <span className="text-white font-bold">{totalRows > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to{' '}
          <span className="text-white font-bold">{Math.min(currentPage * rowsPerPage, totalRows)}</span> of{' '}
          <span className="text-white font-bold">{totalRows}</span> records
        </div>

        <div className="flex items-center gap-3">
          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
            >
              {[5, 10, 20, 50].map(val => (
                <option key={val} value={val} className="bg-[#0a1628] text-white">{val}</option>
              ))}
            </select>
          </div>

          {/* Page switch triggers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <i className="fa-solid fa-angles-left" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <i className="fa-solid fa-angle-left" />
            </button>
            <div className="text-[11px] text-gray-400 px-1">
              Page <span className="text-white font-bold">{currentPage}</span> of{' '}
              <span className="text-white font-bold">{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <i className="fa-solid fa-angle-right" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <i className="fa-solid fa-angles-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
