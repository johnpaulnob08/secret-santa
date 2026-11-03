import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { groupsApi } from '../utils/api';
import { useApp } from '../context/AppContext';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';

const STATUS = {
  draft:    { label: 'Draft',          dot: '#52525b' },
  shuffled: { label: 'Ready to Send',  dot: '#f59e0b' },
  sent:     { label: 'Sent',           dot: '#4ade80' }
};

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const { removeGroup } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await groupsApi.delete(group.id);
      removeGroup(group.id);
      toast.success('Group deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/group/${group.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied');
  };

  const s = STATUS[group.status] || STATUS.draft;
  const count = group.participants?.length || 0;
  const sentCount = group.participants?.filter(p => p.emailStatus === 'sent').length || 0;

  return (
    <>
      <div
        className="card card-hover"
        onClick={() => navigate(`/group/${group.id}`)}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: group.status === 'sent' ? 'var(--green-light)' :
                      group.status === 'shuffled' ? 'var(--gold)' : 'var(--bg5)',
          opacity: group.status === 'draft' ? 0 : 0.6
        }} />

        <div style={{ paddingTop: 4 }}>
          {/* Row 1: name + actions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 6
              }}>
                {group.groupName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <button className="btn-icon" onClick={handleCopy} title="Copy link" style={{ width: 30, height: 30 }}>
                {copied ? <Check size={13} color="var(--green-light)" /> : <Copy size={13} />}
              </button>
              {group.status !== 'sent' && (
                <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setShowDelete(true); }} style={{ width: 30, height: 30 }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: meta */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
              <Users size={12} /> {count} people
            </span>
            {group.exchangeDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
                <Calendar size={12} /> {new Date(group.exchangeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {group.status === 'sent' && (
              <span style={{ fontSize: 12, color: 'var(--green-light)' }}>
                ✓ {sentCount}/{count} delivered
              </span>
            )}
          </div>

          {group.description && (
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.description}
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        variant="danger"
        icon="🗑️"
        title="Delete this group?"
        description={`"${group.groupName}" will be permanently deleted. This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />
    </>
  );
}