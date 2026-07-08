import { useEffect, useMemo, useState } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import ChallengeEditor from '../../components/admin/ChallengeEditor';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAdmin } from '../../hooks/useAdmin';

export default function ChallengeManagement() {
  const { challenges, categories, loading, error, loadChallenges, loadCategories, run, api } = useAdmin();
  const [editing, setEditing] = useState(null); const [showEditor, setShowEditor] = useState(false); const [pendingDelete, setPendingDelete] = useState(null);
  useEffect(() => { loadChallenges().catch(() => {}); loadCategories().catch(() => {}); }, [loadChallenges, loadCategories]);
  async function save(value) { await run(() => api.saveChallenge(value)); setShowEditor(false); await loadChallenges(); }
  async function remove() { await run(() => api.deleteChallenge(pendingDelete._id)); setPendingDelete(null); await loadChallenges(); }
  const columns = useMemo(() => [
    { key: 'title', label: 'Challenge', render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-slate-500">{row.category?.name || 'Unknown'}</p></div> },
    { key: 'difficulty', label: 'Difficulty', render: (row) => <span className="capitalize">{row.difficulty}</span> },
    { key: 'rewardXP', label: 'Reward', render: (row) => `${row.rewardXP} XP` },
    { key: 'activeDate', label: 'Active date', render: (row) => new Date(row.activeDate).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => { setEditing(row); setShowEditor(true); }}>Edit</Button><Button variant="secondary" onClick={() => setPendingDelete(row)}>Delete</Button></div> },
  ], []);
  return <div className="space-y-4"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Challenge management</h1><p className="text-sm text-slate-500">Schedule daily engagement missions.</p></div><Button onClick={() => { setEditing(null); setShowEditor(true); }}>New challenge</Button></header>{error ? <p className="text-sm text-rose-500">{error}</p> : null}{showEditor ? <ChallengeEditor value={editing} categories={categories} onSubmit={save} onCancel={() => setShowEditor(false)} loading={loading} /> : null}{loading && !challenges.length ? <Loader text="Loading challenges..." /> : <AdminTable columns={columns} rows={challenges} /> }<ConfirmationModal open={Boolean(pendingDelete)} title="Delete challenge" message="This also removes completion references from users." confirmLabel="Delete" onConfirm={remove} onClose={() => setPendingDelete(null)} loading={loading} /></div>;
}
