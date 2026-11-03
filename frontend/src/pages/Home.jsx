import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Gift, Shuffle, Mail, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateEmail } from '../utils/helpers';
import GroupCard from '../components/GroupCard';
import Snowflakes from '../components/Snowflakes';
import toast from 'react-hot-toast';

export default function Home() {
  const { groups, adminEmail, setAdmin, fetchGroups, loading } = useApp();
  const [input, setInput] = useState(adminEmail);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (adminEmail) fetchGroups(adminEmail);
  }, [adminEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(input)) { setErr('Enter a valid email address'); return; }
    setErr('');
    setAdmin(input.toLowerCase().trim());
    fetchGroups(input.toLowerCase().trim());
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Snowflakes count={12} />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          padding: 'clamp(60px, 12vw, 100px) 20px 56px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 70%)'
        }}>
          {/* Logo mark */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--red) 0%, #dc2626 100%)',
            boxShadow: '0 8px 32px rgba(239,68,68,0.35)',
            marginBottom: 24,
            animation: 'float 3s ease-in-out infinite'
          }}>
            <Gift size={30} color="white" strokeWidth={2} />
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 7vw, 58px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 14
          }}>
            <span className="glow-text">Secret Santa</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2.5vw, 17px)',
            color: 'var(--text2)',
            maxWidth: 440,
            margin: '0 auto 36px',
            lineHeight: 1.7
          }}>
            Create a group, add participants, shuffle assignments,
            and send private emails — all in minutes.
          </p>

          {/* Email input */}
          <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '0 auto' }}>
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap',
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 14, padding: 6
            }}>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email to get started"
                value={input}
                onChange={e => { setInput(e.target.value); setErr(''); }}
                style={{
                  flex: 1, minWidth: 180, background: 'transparent',
                  border: 'none', boxShadow: 'none', fontSize: 14,
                  padding: '9px 12px'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, flexShrink: 0 }}>
                Continue <ArrowRight size={14} />
              </button>
            </div>
            {err && <p className="form-error" style={{ marginTop: 6, textAlign: 'left' }}>{err}</p>}
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              No account needed. Your email identifies your groups.
            </p>
          </form>
        </div>

        {/* How it works */}
        {!adminEmail && (
          <div className="container" style={{ paddingBottom: 80 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { icon: <Gift size={18} />, step: '01', title: 'Create a group', desc: 'Name your event, set a date and budget' },
                { icon: <Users size={18} />, step: '02', title: 'Add participants', desc: 'Enter 4 to 30 people with their emails' },
                { icon: <Shuffle size={18} />, step: '03', title: 'Shuffle', desc: 'Fair algorithm, no self-pairs, no mutual pairs' },
                { icon: <Mail size={18} />, step: '04', title: 'Send emails', desc: 'Each person gets their assignment privately' }
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'var(--red-muted)', color: 'var(--red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {s.icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.05em' }}>{s.step}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Groups */}
        {adminEmail && (
          <div className="container animate-up" style={{ paddingBottom: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 2 }}>My Groups</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{adminEmail}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
                <Plus size={14} /> New Group
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="card" style={{ height: 90, background: 'var(--bg2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'var(--bg4)', margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Gift size={24} color="var(--text3)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No groups yet</div>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
                  Create your first Secret Santa group to get started
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
                  <Plus size={14} /> Create Group
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {groups.map((g, i) => (
                  <div key={g.id} style={{ animation: 'fadeUp 0.3s ease both', animationDelay: i * 0.05 + 's' }}>
                    <GroupCard group={g} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}