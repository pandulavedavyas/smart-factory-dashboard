export default function StatusBadge({ status, size = 'sm' }) {
  const map = {
    running: { cls: 'status-running', icon: 'fa-circle' },
    idle: { cls: 'status-idle', icon: 'fa-circle' },
    down: { cls: 'status-down', icon: 'fa-circle' },
    in_progress: { cls: 'status-in_progress', icon: 'fa-spinner' },
    completed: { cls: 'status-completed', icon: 'fa-check-circle' },
    low_stock: { cls: 'status-low_stock', icon: 'fa-exclamation-triangle' },
    in_stock: { cls: 'status-in_stock', icon: 'fa-check-circle' },
    active: { cls: 'status-running', icon: 'fa-circle' },
    inactive: { cls: 'status-down', icon: 'fa-circle' },
  };
  const { cls, icon } = map[status] || { cls: 'status-idle', icon: 'fa-circle' };
  const sizes = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-1.5',
  };

  return (
    <span className={`status-badge ${cls} ${sizes[size] || sizes.sm}`}>
      <i className={`fas ${icon} text-[6px]`} style={{ animation: status === 'running' ? 'pulse 2s infinite' : 'none' }} />
      {status?.replace(/_/g, ' ') || 'unknown'}
    </span>
  );
}
