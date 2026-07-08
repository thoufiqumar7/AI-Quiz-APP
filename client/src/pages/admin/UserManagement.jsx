import { useEffect, useMemo, useState } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import UserCard from '../../components/admin/UserCard';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, loadUsers, run, api } = useAdmin();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => { loadUsers({ page: 1, limit: 50 }).catch(() => {}); }, [loadUsers]);

  async function reload() { await loadUsers({ page: 1, limit: 50, search }); }
  async function toggleBlock(user) { await run(() => api.setUserBlocked(user._id, !user.isBlocked)); await reload(); }
  async function updateRole(user, role) { await run(() => api.setUserRole(user._id, role)); await reload(); }
  async function remove() { await run(() => api.deleteAdminUser(pendingDelete._id)); setPendingDelete(null); await reload(); }

  const columns = useMemo(() => [
    { key: 'user', label: 'User', render: (row) => <UserCard user={row} /> },
    { key: 'activity', label: 'Activity', render: (row) => <div><p>Level {row.currentLevel || 1}</p><p className="text-xs text-slate-500">{row.xpPoints || 0} XP</p></div> },
    { key: 'lastLogin', label: 'Last login', render: (row) => row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never' },
    { key: 'role', label: 'Role', render: (row) => <select value={row.role} disabled={row._id === currentUser?.id} onChange={(event) => updateRole(row, event.target.value)} className="admin-input min-w-28"><option value="user">User</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select> },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" disabled={row._id === currentUser?.id} onClick={() => toggleBlock(row)}>{row.isBlocked ? 'Unblock' : 'Block'}</Button><Button variant="secondary" disabled={row._id === currentUser?.id} onClick={() => setPendingDelete(row)}>Delete</Button></div> },
  ], [currentUser?.id]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">User management</h1><p className="text-sm text-slate-500">Roles, access, and account lifecycle.</p></div><form onSubmit={(event) => { event.preventDefault(); reload(); }} className="flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="admin-input" /><Button type="submit">Search</Button></form></header>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      {loading && !users.length ? <Loader text="Loading users..." /> : <AdminTable columns={columns} rows={users} />}
      <ConfirmationModal open={Boolean(pendingDelete)} title="Delete user" message={`Permanently delete ${pendingDelete?.email || 'this user'} and related records?`} confirmLabel="Delete" onConfirm={remove} onClose={() => setPendingDelete(null)} loading={loading} />
    </div>
  );
}
