import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header({ back, title }) {
  const { adminEmail } = useApp();
  const navigate = useNavigate();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,11,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto', padding: '0 20px',
        height: 56, display: 'flex', alignItems: 'center', gap: 12
      }}>
        {back && (
          <button onClick={() => navigate(back)} className="btn-icon" style={{ border: 'none', background: 'transparent', width: 28, height: 28 }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
        )}

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
          }}>
            <Gift size={15} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Hatag
          </span>
        </Link>

        {title && (
          <>
            <span style={{ color: 'var(--border2)', fontSize: 16 }}>/</span>
            <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {title}
            </span>
          </>
        )}

        <div style={{ marginLeft: 'auto' }}>
          {adminEmail && (
            <div style={{
              fontSize: 12, color: 'var(--text3)',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              padding: '5px 12px', borderRadius: 99,
              maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {adminEmail}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}