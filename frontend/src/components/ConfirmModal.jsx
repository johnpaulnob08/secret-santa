import { useEffect } from 'react';

export default function ConfirmModal({
  open, title, description, confirmText, cancelText = 'Cancel',
  onConfirm, onCancel, loading, variant = 'danger', icon
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const iconMap = {
    danger: '⚠️',
    success: '🎅',
    info: 'ℹ️',
    delete: '🗑️'
  };

  const btnClass = variant === 'danger' ? 'btn-danger-outline' : 'btn-success';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', margin: '0 auto 20px',
          background: variant === 'danger' ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.08)',
          border: `1px solid ${variant === 'danger' ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22
        }}>
          {icon || iconMap[variant]}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          {description}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1, height: 42 }}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${btnClass}`}
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, height: 42 }}
          >
            {loading ? <><div className="spinner" style={{ borderTopColor: 'currentColor' }} /> Working...</> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}