/* Utility functions */
function formatNumber(n) { return n?.toLocaleString() || '0'; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ''; }
function formatTime(d) { return d ? new Date(d).toLocaleTimeString() : ''; }
function truncate(s, len = 50) { return s?.length > len ? s.substring(0, len) + '...' : s; }
function capitalize(s) { return s?.charAt(0).toUpperCase() + s?.slice(1); }