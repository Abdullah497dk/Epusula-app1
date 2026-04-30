import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, User } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getRoleName = (role) => {
    switch(role) {
      case 'student': return 'Öğrenci';
      case 'teacher': return 'Öğretmen';
      case 'admin': return 'Yönetici';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-white-off)' }}>
      {/* Sidebar (Mobile Overlay) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        backgroundColor: 'var(--color-white)',
        borderRight: '1px solid var(--color-gray)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Brand */}
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--color-gray)'
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }} className="text-gradient">
            Epusula
          </h1>
          <button onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
            <X size={20} color="var(--color-black-light)" />
          </button>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-purple-light)', 
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-purple)' }}>{getRoleName(user?.role)}</p>
            </div>
          </div>
        </div>

        {/* Navigation Area */}
        <nav style={{ flex: 1, padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', marginBottom: '1rem', fontWeight: 500 }}>MENÜ</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <a href="#" style={{ 
                display: 'block', 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'var(--color-purple)', 
                color: 'var(--color-white)',
                fontWeight: 500
              }}>
                Pano (Dashboard)
              </a>
            </li>
            {/* More links would go here based on role */}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-gray)' }}>
          <button 
            onClick={logout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--color-black-light)',
              fontWeight: 500,
              width: '100%',
              padding: '0.5rem 0'
            }}
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: window.innerWidth > 768 ? (sidebarOpen ? '260px' : '0') : '0', // Basic responsiveness handle, ideally handled via CSS media queries
        transition: 'margin-left 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{ 
          height: '64px',
          backgroundColor: 'var(--color-white)',
          borderBottom: '1px solid var(--color-gray)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}
            >
              <Menu size={24} color="var(--color-black-light)" />
            </button>
          )}
          {/* Header Title could be dynamics */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--color-black)' }}>
            Hoş Geldin, {user?.name.split(' ')[0]}
          </h2>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem', flex: 1, overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Dynamic styles override for desktop sidebar to be always visible */}
      <style>{`
        @media (min-width: 768px) {
          aside { transform: translateX(0) !important; }
          .main-wrapper { margin-left: 260px !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
