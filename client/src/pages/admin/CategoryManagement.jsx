import { useEffect, useMemo, useState } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import CategoryEditor from '../../components/admin/CategoryEditor';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAdmin } from '../../hooks/useAdmin';

export default function CategoryManagement() {
  const { categories, loading, error, loadCategories, run, api } = useAdmin();
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  useEffect(() => { loadCategories().catch(() => {}); }, [loadCategories]);
  async function save(value) { await run(() => api.saveCategory(value)); setShowEditor(false); await loadCategories(); }
  async function remove() { await run(() => api.deleteCategory(pendingDelete._id)); setPendingDelete(null); await loadCategories(); }
  const columns = useMemo(() => [
    { key: 'name', label: 'Name', render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-slate-500">{row.icon}</p></div> },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => { setEditing(row); setShowEditor(true); }}>Edit</Button><Button variant="secondary" onClick={() => setPendingDelete(row)}>Delete</Button></div> },
  ], []);
  return <div className="space-y-4"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Category management</h1><p className="text-sm text-slate-500">Organize quiz content domains.</p></div><Button onClick={() => { setEditing(null); setShowEditor(true); }}>New category</Button></header>{error ? <p className="text-sm text-rose-500">{error}</p> : null}{showEditor ? <CategoryEditor value={editing} onSubmit={save} onCancel={() => setShowEditor(false)} loading={loading} /> : null}{loading && !categories.length ? <Loader text="Loading categories..." /> : <AdminTable columns={columns} rows={categories} /> }<ConfirmationModal open={Boolean(pendingDelete)} title="Delete category" message="Deletion is blocked while questions or quiz history reference this category." confirmLabel="Delete" onConfirm={remove} onClose={() => setPendingDelete(null)} loading={loading} /></div>;
}
