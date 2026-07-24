import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import MyClasses from './pages/MyClasses';
import StudentStats from './pages/StudentStats';
import MyStats from './pages/MyStats';


// Onaylanmamış admin için bekleme ekranı (iki adımlı admin girişi)
const AdminPending = () => {
  const { user, logout } = useAuth();
  const rejected = user?.adminStatus === 'rejected';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'var(--color-white-off)' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{rejected ? '⛔' : '⏳'}</div>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>
          {rejected ? 'Admin Başvurunuz Reddedildi' : 'Admin Onayı Bekleniyor'}
        </h1>
        <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {rejected
            ? 'Yönetici erişim talebiniz ana admin tarafından onaylanmadı. Bilgi için epusula.akademi@gmail.com ile iletişime geçebilirsiniz.'
            : 'Yönetici hesabınız ana admin (epusula.akademi@gmail.com) onayından sonra aktifleşecek. Onaylandığında giriş yaparak yönetici paneline erişebilirsiniz.'}
        </p>
        <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }} onClick={logout}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access an unauthorized route
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  // Admin onay kapısı: onaylanmamış admin hiçbir yönetici işlevine erişemez
  if (user.role === 'admin' && user.adminStatus !== 'approved') {
    return <AdminPending />;
  }

  return <Layout>{children}</Layout>;
};

// Root Route Component
const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-white-off)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--color-purple-light)',
          borderTopColor: 'var(--color-purple)',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (user) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { passwordRecovery } = useAuth();

  // Şifre sıfırlama linkiyle gelindiyse, her şeyin önüne "yeni şifre" ekranını koy
  if (passwordRecovery) {
    return <ResetPassword />;
  }

  return (
    <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Profile Route for all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-classes" 
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher']}>
                <MyClasses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student-stats/:studentId" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'student']}>
                <StudentStats />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-stats" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyStats />
              </ProtectedRoute>
            } 
          />

          {/* Teacher Routes */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
