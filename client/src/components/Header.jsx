import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Flame, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="dashboard-header feature-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.5rem' }}>
        <Link to="/dashboard" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
          <Sparkles size={24} />
          <span>Eatly</span>
        </Link>
        
        <nav className="dashboard-nav" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isDashboard && (
            <Link to="/dashboard" className="nav-item btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={20} />
              <span className="mobile-hide">Dashboard</span>
            </Link>
          )}

          <Link to="/streaks" className={`nav-item btn btn-ghost btn-sm ${location.pathname === '/streaks' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: location.pathname === '/streaks' ? 'var(--primary)' : 'inherit' }}>
            <Flame size={20} />
            <span className="mobile-hide">Streaks</span>
          </Link>

          <ThemeToggle />

          <button className="nav-item btn btn-ghost btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={20} />
            <span className="mobile-hide">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
