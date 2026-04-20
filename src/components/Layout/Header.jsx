import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePDF } from '../../contexts/PDFContext';
import {
  PanelLeft, Bot, LogOut, User, ChevronDown, BookOpen,
} from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, toggleAI, aiPanelOpen, sidebarOpen, fileName } = usePDF();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <header className="header">
      <button className={`btn-icon ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar} title="Toggle sidebar">
        <PanelLeft size={18} />
      </button>

      <div className="header-logo">
        <BookOpen size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        BookReader
      </div>

      {fileName && (
        <span style={{
          fontSize: 13, color: 'var(--text-muted)',
          maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {fileName}
        </span>
      )}

      <div className="header-spacer" />

      {/* AI Toggle */}
      <button
        className={`btn btn-ghost btn-sm ${aiPanelOpen ? 'active' : ''}`}
        style={aiPanelOpen ? { borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' } : {}}
        onClick={toggleAI}
        title="AI Assistant"
      >
        <Bot size={15} />
        <span>AI Assistant</span>
        {aiPanelOpen && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent-secondary)',
            boxShadow: '0 0 6px var(--accent-secondary)',
          }} />
        )}
      </button>

      {/* User Menu */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none' }}
          onClick={() => setMenuOpen((p) => !p)}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
          ) : (
            <div className="user-avatar" style={{ background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#fff" />
            </div>
          )}
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {menuOpen && (
          <div className="user-menu">
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.displayName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
            </div>
            <button className="user-menu-item danger" onClick={handleLogout}>
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
