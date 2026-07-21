export function Field({ label, type = 'text', icon, value, onChange, placeholder, required, autoComplete }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>{label}</label>
      <div className="relative">
        {icon && (
          <i className={`fas ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-xs`} style={{ color: '#556677' }} />
        )}
        <input
          type={type}
          className={`input text-white ${icon ? '!pl-10' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          style={{ color: '#FFFFFF' }}
        />
      </div>
    </div>
  );
}
