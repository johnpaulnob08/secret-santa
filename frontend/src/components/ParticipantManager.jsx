import { useState } from 'react';
import { Trash2, UserPlus, ListChecks } from 'lucide-react';
import { validateEmail } from '../utils/helpers';

const empty = () => ({ name: '', email: '', wishlist: '' });

export default function ParticipantManager({ participants, onChange }) {
  const [showWishlist, setShowWishlist] = useState(false);

  const update = (i, field, val) => {
    const next = [...participants];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const add = () => {
    if (participants.length >= 30) return;
    onChange([...participants, empty()]);
  };

  const remove = (i) => {
    if (participants.length <= 1) return;
    onChange(participants.filter((_, idx) => idx !== i));
  };

  const emails = participants.map(p => p.email?.toLowerCase().trim());
  const isDupe = (email, idx) => email && emails.some((e, i) => i !== idx && e === email.toLowerCase().trim());

  const filled = participants.filter(p => p.name.trim() && p.email.trim()).length;
  const progress = Math.min((filled / 4) * 100, 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Participants</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: filled >= 4 ? 'var(--green-muted)' : 'rgba(239,68,68,0.08)',
              color: filled >= 4 ? 'var(--green-light)' : 'var(--red)',
              border: '1px solid ' + (filled >= 4 ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)')
            }}>
              {participants.length} / 30
            </span>
          </div>
          {filled < 4 && (
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              {4 - filled} more needed to shuffle
            </p>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox" checked={showWishlist}
            onChange={e => setShowWishlist(e.target.checked)}
            style={{ accentColor: 'var(--red)', width: 13, height: 13 }}
          />
          <ListChecks size={13} />
          Wishlists
        </label>
      </div>

      {filled < 4 && (
        <div style={{ height: 2, background: 'var(--bg5)', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: progress + '%', background: 'var(--red)', borderRadius: 99, transition: 'width 0.3s ease' }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {participants.map((p, i) => {
          const emailErr = p.email && !validateEmail(p.email) ? 'Invalid email'
                         : isDupe(p.email, i) ? 'Duplicate email' : null;
          const isValid = p.name.trim() && p.email.trim() && !emailErr;

          return (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'var(--bg3)',
              border: '1px solid ' + (emailErr ? 'rgba(239,68,68,0.25)' : 'var(--border)'),
              borderRadius: 12,
              padding: '12px 14px',
              transition: 'border-color 0.15s'
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: isValid ? 'var(--green-muted)' : 'var(--bg5)',
                border: '1px solid ' + (isValid ? 'rgba(74,222,128,0.3)' : 'var(--border)'),
                color: isValid ? 'var(--green-light)' : 'var(--text3)',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                {isValid ? '✓' : i + 1}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Name"
                    value={p.name}
                    onChange={e => update(i, 'name', e.target.value)}
                    style={{ fontSize: 13, padding: '8px 12px' }}
                  />
                  <div>
                    <input
                      className={'form-input' + (emailErr ? ' error' : '')}
                      placeholder="Email"
                      type="email"
                      value={p.email}
                      onChange={e => update(i, 'email', e.target.value)}
                      style={{ fontSize: 13, padding: '8px 12px' }}
                    />
                    {emailErr && <p className="form-error" style={{ marginTop: 3, fontSize: 11 }}>{emailErr}</p>}
                  </div>
                </div>
                {showWishlist && (
                  <input
                    className="form-input"
                    placeholder="Wishlist (optional)"
                    value={p.wishlist || ''}
                    onChange={e => update(i, 'wishlist', e.target.value)}
                    style={{ fontSize: 13, padding: '8px 12px' }}
                  />
                )}
              </div>

              <button
                className="btn-icon danger"
                onClick={() => remove(i)}
                disabled={participants.length <= 1}
                style={{ width: 28, height: 28, marginTop: 1, flexShrink: 0 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {participants.length < 30 && (
        <button className="btn btn-ghost" onClick={add} style={{ marginTop: 10, width: '100%', borderStyle: 'dashed' }}>
          <UserPlus size={14} />
          Add Participant
        </button>
      )}
    </div>
  );
}