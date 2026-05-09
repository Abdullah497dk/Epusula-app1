import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout, joinRequests, customClasses } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getDashboardPath = (role) => {
    switch(role) {
      case 'student': return '/student/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

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
      <aside 
        className={sidebarOpen ? 'sidebar-open' : ''}
        style={{
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
            <li className="nav-item">
              <Link 
                to={getDashboardPath(user?.role)} 
                onClick={() => setSidebarOpen(false)}
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: location.pathname.includes('/dashboard') ? 'var(--color-purple)' : 'transparent', 
                  color: location.pathname.includes('/dashboard') ? 'var(--color-white)' : 'var(--color-black)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Pano (Dashboard)
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/leaderboard" 
                onClick={() => setSidebarOpen(false)}
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: location.pathname === '/leaderboard' ? 'var(--color-purple)' : 'transparent', 
                  color: location.pathname === '/leaderboard' ? 'var(--color-white)' : 'var(--color-black)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Sıralama (Leaderboard)
              </Link>
            </li>
            {(user?.role === 'student' || user?.role === 'teacher') && (
              <li className="nav-item">
                <Link 
                  to="/my-classes" 
                  onClick={() => setSidebarOpen(false)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: location.pathname === '/my-classes' ? 'var(--color-purple)' : 'transparent', 
                    color: location.pathname === '/my-classes' ? 'var(--color-white)' : 'var(--color-black)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>Sınıflarım</span>
                  {user?.role === 'teacher' && (() => {
                    const myClasses = (customClasses || []).filter(c => c.teacherId === user.id);
                    const myClassIds = myClasses.map(c => c.id);
                    const pendingCount = (joinRequests || []).filter(r => r.status === 'pending' && myClassIds.includes(r.classId)).length;
                    
                    if (pendingCount > 0) {
                      return (
                        <span style={{ 
                          backgroundColor: '#ef4444', 
                          color: 'white', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          padding: '0.1rem 0.5rem', 
                          borderRadius: '10px',
                          marginLeft: '0.5rem',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link 
                to="/profile" 
                onClick={() => setSidebarOpen(false)}
                style={{ 
                  display: 'block', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: location.pathname === '/profile' ? 'var(--color-purple)' : 'transparent', 
                  color: location.pathname === '/profile' ? 'var(--color-white)' : 'var(--color-black)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Profilim
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-gray)' }}>
          <button 
            onClick={logout}
            className="logout-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              color: '#ef4444',
              fontWeight: 600,
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper" style={{ 
        flex: 1, 
        marginLeft: '0', 
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
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
              className="menu-btn"
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
      
      {/* Dynamic styles for animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .nav-item {
          opacity: 0;
        }

        .sidebar-open .nav-item {
          animation: slideIn 0.4s ease forwards;
        }

        .sidebar-open .nav-item:nth-child(1) { animation-delay: 0.1s; }
        .sidebar-open .nav-item:nth-child(2) { animation-delay: 0.2s; }
        .sidebar-open .nav-item:nth-child(3) { animation-delay: 0.3s; }

        .nav-item a:hover {
          transform: translateX(5px);
          background-color: rgba(112, 38, 185, 0.05) !important;
          color: var(--color-purple) !important;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }

        @media (min-width: 768px) {
          aside { 
            transform: translateX(0) !important; 
            box-shadow: none !important;
          }
          .main-wrapper { margin-left: 260px !important; }
          .menu-btn { display: none !important; }
          .nav-item { opacity: 1 !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
