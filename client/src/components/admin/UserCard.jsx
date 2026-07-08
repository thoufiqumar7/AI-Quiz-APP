export default function UserCard({ user }) {
  return (
    <div>
      <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
      <p className="text-xs text-slate-500">{user.email}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize dark:bg-slate-800">
          {user.role}
        </span>
        {user.isBlocked ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
            Blocked
          </span>
        ) : null}
      </div>
    </div>
  );
}
