import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { AdminProvider } from '../context/AdminContext';

export default function AdminLayout() {
  return (
    <AdminProvider>
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AdminSidebar />
        <section className="min-w-0"><Outlet /></section>
      </div>
    </AdminProvider>
  );
}
