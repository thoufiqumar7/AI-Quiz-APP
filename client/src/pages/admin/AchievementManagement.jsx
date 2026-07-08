import { useEffect, useMemo, useState } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import AchievementEditor from '../../components/admin/AchievementEditor';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAdmin } from '../../hooks/useAdmin';

export default function AchievementManagement() {
  const { achievements, loading, error, loadAchievements, run, api } = useAdmin();
  const [editing, setEditing] = useState(null); const [showEditor, setShowEditor] = useState(false); const [pendingDelete, setPendingDelete] = useState(null);
  useEffect(() => { loadAchievements().catch(() => {}); }, [loadAchievements]);
  async function save(value) { await run(() => api.saveAchievement(value)); setShowEditor(false); await loadAchievements(); }
  async function remove() { await run(() => api.deleteAchievement(pendingDelete._id)); setPendingDelete(null); await loadAchievements(); }
  const columns = useMemo(() => [
    { key: 'title', label: 'Achievement', render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-slate-500">{row.description}</p></div> },
    { key: 'conditionType', label: 'Condition', render: (row) => `${row.conditionType.replaceAll('_', ' ')} ≥ ${row.conditionValue}` },
    { key: 'xpReward', label: 'Reward', render: (row) => `${row.xpReward} XP` },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => { setEditing(row); setShowEditor(true); }}>Edit</Button><Button variant="secondary" onClick={() => setPendingDelete(row)}>Delete</Button></div> },
  ], []);
  return <div className="space-y-4"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Achievement management</h1><p className="text-sm text-slate-500">Define rewards and unlock rules.</p></div><Button onClick={() => { setEditing(null); setShowEditor(true); }}>New achievement</Button></header>{error ? <p className="text-sm text-rose-500">{error}</p> : null}{showEditor ? <AchievementEditor value={editing} onSubmit={save} onCancel={() => setShowEditor(false)} loading={loading} /> : null}{loading && !achievements.length ? <Loader text="Loading achievements..." /> : <AdminTable columns={columns} rows={achievements} /> }<ConfirmationModal open={Boolean(pendingDelete)} title="Delete achievement" message="This removes the achievement and its user unlock references." confirmLabel="Delete" onConfirm={remove} onClose={() => setPendingDelete(null)} loading={loading} /></div>;
}
