import { useEffect, useMemo, useState } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import QuestionEditor from '../../components/admin/QuestionEditor';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAdmin } from '../../hooks/useAdmin';

export default function QuestionManagement() {
  const { questions, categories, loading, error, loadQuestions, loadCategories, run, api } = useAdmin();
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => { loadQuestions({ page: 1, limit: 50 }).catch(() => {}); loadCategories().catch(() => {}); }, [loadQuestions, loadCategories]);
  async function reload() { await loadQuestions({ page: 1, limit: 50 }); }
  async function save(value) { await run(() => api.saveQuestion(value)); setShowEditor(false); setEditing(null); await reload(); }
  async function remove() { await run(() => api.deleteQuestion(pendingDelete._id)); setPendingDelete(null); await reload(); }

  const columns = useMemo(() => [
    { key: 'question', label: 'Question', render: (row) => <div className="max-w-xl"><p className="font-medium">{row.question}</p><p className="text-xs text-slate-500">{row.topic}</p></div> },
    { key: 'category', label: 'Category', render: (row) => row.category?.name || 'Unknown' },
    { key: 'difficulty', label: 'Difficulty', render: (row) => <span className="capitalize">{row.difficulty}</span> },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => { setEditing(row); setShowEditor(true); }}>Edit</Button><Button variant="secondary" onClick={() => setPendingDelete(row)}>Delete</Button></div> },
  ], []);

  return <div className="space-y-4"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Question management</h1><p className="text-sm text-slate-500">Create and maintain the quiz bank.</p></div><Button onClick={() => { setEditing(null); setShowEditor(true); }}>New question</Button></header>{error ? <p className="text-sm text-rose-500">{error}</p> : null}{showEditor ? <QuestionEditor value={editing} categories={categories} onSubmit={save} onCancel={() => setShowEditor(false)} loading={loading} /> : null}{loading && !questions.length ? <Loader text="Loading questions..." /> : <AdminTable columns={columns} rows={questions} /> }<ConfirmationModal open={Boolean(pendingDelete)} title="Delete question" message="This removes the question from future quizzes. Historical answer snapshots remain intact." confirmLabel="Delete" onConfirm={remove} onClose={() => setPendingDelete(null)} loading={loading} /></div>;
}
