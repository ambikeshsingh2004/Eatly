import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="btn btn-ghost btn-icon"
      aria-label="Toggle Theme"
      style={{ 
        color: isDark ? 'var(--text-secondary)' : 'var(--warning)',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(245, 158, 11, 0.1)'
      }}
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
