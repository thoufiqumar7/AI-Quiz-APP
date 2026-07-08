import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuiz } from '../../hooks/useQuiz';
import { useThemeContext } from '../../context/ThemeContext';
import Button from './Button';

function navLinkClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm transition ${
    isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
  }`;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { resetQuiz, clearResult } = useQuiz();
  const { theme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

  async function handleLogout() {
    resetQuiz();
    clearResult();
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight text-emerald-500">
          SmartQuiz AI
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/categories" className={navLinkClass}>Quiz</NavLink>
              <NavLink to="/recommendations" className={navLinkClass}>Smart AI</NavLink>
              <NavLink to="/gamification" className={navLinkClass}>Gamify</NavLink>
              <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
              <NavLink to="/share" className={navLinkClass}>Share</NavLink>
              {user?.role === 'admin' ? <NavLink to="/admin" className={navLinkClass}>Admin</NavLink> : null}
              <span className="hidden text-xs text-slate-500 md:inline">{user?.email}</span>
              <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass}>Register</NavLink>
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </div>
    </header>
  );
}
