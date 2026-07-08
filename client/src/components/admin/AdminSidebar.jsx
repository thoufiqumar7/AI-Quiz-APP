import { NavLink } from 'react-router-dom';

const items = [
  ['/admin', 'Overview', true],
  ['/admin/users', 'Users'],
  ['/admin/questions', 'Questions'],
  ['/admin/categories', 'Categories'],
  ['/admin/challenges', 'Challenges'],
  ['/admin/achievements', 'Achievements'],
];

export default function AdminSidebar() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
        Control room
      </p>
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(([to, label, end]) => (
          <NavLink
            key={to}
            to={to}
            end={Boolean(end)}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
