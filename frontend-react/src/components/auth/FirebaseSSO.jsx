export function FirebaseSSO({ onClick, loading, label = 'Continue with Google' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-60 hover:!border-[#FF4757]/40"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F4F8' }}
    >
      <i className="fab fa-google" style={{ color: '#FF4757' }} />
      {label}
    </button>
  );
}
