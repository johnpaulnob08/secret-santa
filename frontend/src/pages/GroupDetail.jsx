import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Shuffle, Mail, Users, Calendar, Copy, Check, DollarSign } from 'lucide-react';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import { groupsApi, shuffleApi, emailApi } from '../utils/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const EMAIL_COLOR = { sent: 'var(--green-light)', failed: 'var(--red)', pending: 'var(--text3)' };
const EMAIL_LABEL = { sent: 'Sent', failed: 'Failed', pending: 'Pending' };

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upsertGroup } = useApp();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shuffling, setShuffling] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showShuffle, setShowShuffle] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [emailResults, setEmailResults] = useState(null);

  const load = async () => {
    try {
      const res = await groupsApi.getOne(id);
      setGroup(res.data.group);
    } catch {
      toast.error('Group not found'); navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleShuffle = async () => {
    setShuffling(true);
    setShowShuffle(false);
    try {
      const res = await shuffleApi.generate(id);
      toast.success(res.data.assignmentCount + ' assignments shuffled!');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShuffling(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setShowSend(false);
    try {
      const res = await emailApi.sendAll(id);
      setEmailResults(res.data);
      if (res.data.failed === 0) {
        toast.success('All ' + res.data.sent + ' emails sent!');
      } else {
        toast('Sent ' + res.data.sent + ', failed ' + res.data.failed, { icon: '⚠️' });
      }
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied');
  };

  if (loading) return (
    <>
      <Header back="/" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2.5, color: 'var(--red)' }} />
      </div>
    </>
  );

  if (!group) return null;

  const participants = group.participants || [];
  const sentCount = participants.filter(p => p.emailStatus === 'sent').length;
  const failedCount = participants.filter(p => p.emailStatus === 'failed').length;

  const statusDot = group.status === 'sent' ? 'var(--green-light)' : group.status === 'shuffled' ? 'var(--gold)' : 'var(--text3)';
  const statusLabel = group.status === 'sent' ? 'Emails Sent' : group.status === 'shuffled' ? 'Ready to Send' : 'Draft';

  // Progress steps
  const steps4 = [
    { label: 'Created', done: true },
    { label: 'Participants', done: participants.length >= 4 },
    { label: 'Shuffled', done: group.status === 'shuffled' || group.status === 'sent' },
    { label: 'Emails Sent', done: group.status === 'sent' }
  ];

  return (
    <>
      <Header back="/" title={group.groupName} />

      <div className="container-sm" style={{ padding: 'clamp(20px, 4vw, 40px) 20px 80px' }}>

        {/* Group header card */}
        <div className="card" style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: statusDot, opacity: group.status === 'draft' ? 0 : 0.7
          }} />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 4 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <h1 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
                {group.groupName}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusDot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{statusLabel}</span>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
                  <Users size={12} /> {participants.length} participants
                </span>
                {group.exchangeDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
                    <Calendar size={12} />
                    {new Date(group.exchangeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {group.budget && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>₱</span> {group.budget}
                  </span>
                )}
                {group.status === 'sent' && (
                  <span style={{ fontSize: 12, color: 'var(--green-light)' }}>
                    ✓ {sentCount}/{participants.length} delivered
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn-icon" onClick={handleCopy} title="Copy link">
                {copied ? <Check size={14} color="var(--green-light)" /> : <Copy size={14} />}
              </button>

              {group.status !== 'sent' && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/edit/' + id)}>
                  <Edit2 size={13} /> Edit
                </button>
              )}

              {group.status !== 'sent' && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowShuffle(true)}
                  disabled={shuffling || participants.length < 4}
                >
                  {shuffling
                    ? <><div className="spinner" style={{ color: 'var(--text)', width: 13, height: 13, borderWidth: 2 }} /> Shuffling...</>
                    : <><Shuffle size={13} /> {group.status === 'shuffled' ? 'Reshuffle' : 'Shuffle'}</>
                  }
                </button>
              )}

              {group.status === 'shuffled' && (
                <button className="btn btn-success btn-sm" onClick={() => setShowSend(true)} disabled={sending}>
                  {sending
                    ? <><div className="spinner" style={{ color: 'white', width: 13, height: 13, borderWidth: 2 }} /> Sending...</>
                    : <><Mail size={13} /> Send Emails</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {steps4.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: s.done ? 'var(--green-muted)' : 'var(--bg4)',
                    border: '1.5px solid ' + (s.done ? 'rgba(74,222,128,0.4)' : 'var(--border)'),
                    color: s.done ? 'var(--green-light)' : 'var(--text3)',
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s', flexShrink: 0
                  }}>
                    {s.done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: s.done ? 'var(--green-light)' : 'var(--text3)', textAlign: 'center', lineHeight: 1.2, fontWeight: 500 }}>
                    {s.label}
                  </span>
                </div>
                {i < steps4.length - 1 && (
                  <div style={{
                    flex: 1, height: 1.5, marginBottom: 18, margin: '0 6px 18px',
                    background: s.done ? 'rgba(74,222,128,0.3)' : 'var(--border)',
                    transition: 'background 0.3s'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action banners */}
        {group.status === 'draft' && participants.length >= 4 && (
          <div style={{
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{ fontSize: 20 }}>🎲</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>Ready to shuffle</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Generate random Secret Santa assignments</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowShuffle(true)} disabled={shuffling}>
              <Shuffle size={13} /> Shuffle
            </button>
          </div>
        )}

        {group.status === 'shuffled' && (
          <div style={{
            background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>Assignments ready!</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Send each participant their private assignment</div>
            </div>
            <button className="btn btn-success btn-sm" onClick={() => setShowSend(true)} disabled={sending}>
              <Mail size={13} /> Send Emails
            </button>
          </div>
        )}

        {/* Email results */}
        {emailResults && (
          <div className="card" style={{ marginBottom: 16, background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Email Results</div>
            <div style={{ display: 'flex', gap: 20, marginBottom: emailResults.failed > 0 ? 12 : 0 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-light)', lineHeight: 1 }}>{emailResults.sent}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Sent</div>
              </div>
              {emailResults.failed > 0 && (
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>{emailResults.failed}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Failed</div>
                </div>
              )}
            </div>
            {emailResults.results?.filter(r => r.status === 'failed').map(r => (
              <div key={r.email} style={{ fontSize: 12, color: '#f87171', padding: '2px 0' }}>
                ✗ {r.email}
              </div>
            ))}
          </div>
        )}

        {/* Participants */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Participants</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{participants.length} people</span>
          </div>

          <div>
            {participants.map((p, i) => {
              const es = p.emailStatus || 'pending';
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0', gap: 12,
                  borderBottom: i < participants.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: 'var(--bg4)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15
                    }}>
                      🎅
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
                      {p.wishlist && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>🎁 {p.wishlist}</div>}
                    </div>
                  </div>

                  {group.status !== 'draft' && (
                    <div style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, flexShrink: 0,
                      color: EMAIL_COLOR[es],
                      background: EMAIL_COLOR[es] + '18',
                      border: '1px solid ' + EMAIL_COLOR[es] + '30'
                    }}>
                      {EMAIL_LABEL[es]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom message */}
        {group.customMessage && (
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Message to participants</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{group.customMessage}"
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={showShuffle}
        variant="info"
        icon="🎲"
        title={group.status === 'shuffled' ? 'Reshuffle assignments?' : 'Shuffle assignments?'}
        description={group.status === 'shuffled'
          ? 'This will replace existing assignments with new random ones. Emails have not been sent yet.'
          : 'Generate random Secret Santa assignments for all ' + participants.length + ' participants.'}
        confirmText="Shuffle"
        onConfirm={handleShuffle}
        onCancel={() => setShowShuffle(false)}
        loading={shuffling}
      />

      <ConfirmModal
        open={showSend}
        variant="success"
        icon="📧"
        title="Send emails to everyone?"
        description={'This will privately email all ' + participants.length + ' participants their Secret Santa assignment. This cannot be undone.'}
        confirmText="Send All Emails"
        onConfirm={handleSend}
        onCancel={() => setShowSend(false)}
        loading={sending}
      />
    </>
  );
}