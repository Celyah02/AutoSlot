import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { titleCaseRole } from '../lib/format';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'admin' ? [{ to: '/parking-management', label: 'Parking Management' }] : []),
    { to: '/car-entry', label: 'Car Entry' },
    { to: '/car-exit', label: 'Car Exit' },
    { to: '/reports', label: 'Reports' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">X</div>
          <div>
            <p>XWZ LTD</p>
            <span>Parking Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-role">{titleCaseRole(user?.role)}</p>
          <button type="button" className="ghost-button full-width" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations Console</p>
            <h2>Welcome back, {user?.firstName || 'Team'}.</h2>
          </div>
          <div className="topbar-user">
            <span>{user?.email}</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
