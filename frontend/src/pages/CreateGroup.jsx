import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Header from '../components/Header';
import ParticipantManager from '../components/ParticipantManager';
import { useApp } from '../context/AppContext';
import { groupsApi } from '../utils/api';
import { validateEmail } from '../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['Details', 'Participants', 'Review'];
const empty = () => ({ name: '', email: '', wishlist: '' });

export default function CreateGroup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { adminEmail, upsertGroup } = useApp();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [form, setForm] = useState({
    groupName: '', adminEmail: adminEmail || '', adminName: '',
    description: '', exchangeDate: '', customMessage: '', budget: ''
  });
  const [errors, setErrors] = useState({});
  const [participants, setParticipants] = useState([empty(), empty(), empty(), empty()]);

  useEffect(() => {
    if (!isEditing) return;
    groupsApi.getOne(id).then(res => {
      const g = res.data.group;
      setForm({
        groupName: g.groupName || '', adminEmail: g.adminEmail || adminEmail || '',
        adminName: g.adminName || '', description: g.description || '',
        exchangeDate: g.exchangeDate ? g.exchangeDate.substring(0, 10) : '',
        customMessage: g.customMessage || '', budget: g.budget || ''
      });
      const p = g.participants || [];
      setParticipants(p.length >= 4 ? p : [...p, ...Array(4 - p.length).fill(null).map(empty)]);
      setFetching(false);
    }).catch(() => { toast.error('Group not found'); navigate('/'); });
  }, [id]);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = {...e}; delete n[k]; return n; });
  };

  const validate0 = () => {
    const e = {};
    if (!form.groupName.trim() || form.groupName.trim().length < 2) e.groupName = 'Group name required (min 2 chars)';
    if (!validateEmail(form.adminEmail)) e.adminEmail = 'Valid email required';
    if (!form.adminName.trim()) e.adminName = 'Your name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate1 = () => {
    const valid = participants.filter(p => p.name.trim() && p.email.trim());
    if (valid.length < 4) { toast.error('At least 4 participants required'); return false; }
    const emails = valid.map(p => p.email.toLowerCase());
    if (new Set(emails).size !== emails.length) { toast.error('Duplicate emails found'); return false; }
    const bad = valid.find(p => !validateEmail(p.email));
    if (bad) { toast.error('Invalid email: ' + bad.email); return false; }
    return true;
  };

  const next = () => {
    if (step === 0 && !validate0()) return;
    if (step === 1 && !validate1()) return;
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (!validate0() || !validate1()) { setStep(0); return; }
    setLoading(true);
    try {
      const payload = { ...form, participants: participants.filter(p => p.name.trim() && p.email.trim()) };
      const res = isEditing ? await groupsApi.update(id, payload) : await groupsApi.create(payload);
      upsertGroup(res.data.group);
      toast.success(isEditing ? 'Group updated!' : 'Group created!');
      navigate('/group/' + res.data.group.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2.5, color: 'var(--red)' }} />
    </div>
  );

  const validP = participants.filter(p => p.name.trim() && p.email.trim());

  return (
    <>
      <Header back="/" title={isEditing ? 'Edit Group' : 'New Group'} />
      <div className="container-sm" style={{ padding: 'clamp(24px, 5vw, 44px) 20px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
            {isEditing ? 'Edit Group' : 'Create Group'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            {isEditing ? 'Update your Secret Santa group details' : 'Set up your Secret Santa exchange in a few steps'}
          </p>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className={'stepper-item' + (i === step ? ' active' : i < step ? ' done' : '')}>
                <div className="stepper-circle">
                  {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
                </div>
                <span className="stepper-label hide-mobile">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={'stepper-line' + (i < step ? ' done' : '')} />}
            </div>
          ))}
        </div>

        {/* Step 0 */}
        {step === 0 && (
          <div className="animate-up">
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>Group Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Group Name *</label>
                  <input className={'form-input' + (errors.groupName ? ' error' : '')}
                    placeholder="e.g. Office Christmas 2025"
                    value={form.groupName} onChange={e => setField('groupName', e.target.value)} />
                  {errors.groupName && <p className="form-error">{errors.groupName}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Exchange Date</label>
                    <input className="form-input" type="date"
                      value={form.exchangeDate} onChange={e => setField('exchangeDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Limit</label>
                    <input className="form-input" placeholder="e.g. ₱500"
                      value={form.budget} onChange={e => setField('budget', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" placeholder="Optional event description or instructions..."
                    value={form.description} onChange={e => setField('description', e.target.value)}
                    style={{ minHeight: 80 }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>Organizer</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className={'form-input' + (errors.adminName ? ' error' : '')}
                      placeholder="Your name"
                      value={form.adminName} onChange={e => setField('adminName', e.target.value)} />
                    {errors.adminName && <p className="form-error">{errors.adminName}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Email *</label>
                    <input className={'form-input' + (errors.adminEmail ? ' error' : '')}
                      type="email" placeholder="your@email.com"
                      value={form.adminEmail} onChange={e => setField('adminEmail', e.target.value)} />
                    {errors.adminEmail && <p className="form-error">{errors.adminEmail}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Message to Participants</label>
                  <textarea className="form-input" placeholder="A personal note from you included in the emails..."
                    value={form.customMessage} onChange={e => setField('customMessage', e.target.value)}
                    style={{ minHeight: 72 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-up">
            <div className="card">
              <ParticipantManager participants={participants} onChange={setParticipants} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>Summary</div>
              {[
                ['Group Name', form.groupName],
                ['Organizer', form.adminName + ' · ' + form.adminEmail],
                ['Participants', validP.length + ' people'],
                ['Exchange Date', form.exchangeDate ? new Date(form.exchangeDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
                ['Budget', form.budget || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text3)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>
                Participants ({validP.length})
              </div>
              <div>
                {validP.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0', borderBottom: i < validP.length - 1 ? '1px solid var(--border)' : 'none', gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'var(--red-muted)', color: 'var(--red)',
                        fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>{p.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 10 }}>
          {step > 0 ? (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={next}>
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ minWidth: 148 }}>
              {loading
                ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> {isEditing ? 'Saving...' : 'Creating...'}</>
                : <><Check size={15} /> {isEditing ? 'Save Changes' : 'Create Group'}</>
              }
            </button>
          )}
        </div>
      </div>
    </>
  );
}