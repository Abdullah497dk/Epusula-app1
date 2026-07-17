import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, BookOpen, GraduationCap } from 'lucide-react';
import { classes } from '../data/mockData';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [classId, setClassId] = useState('class-6'); // Default to class-6
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { user, loading: authLoading, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setSubmitting(true);
    const userData = { name, email, password, role };
    if (role === 'student') {
      userData.classId = classId;
    }

    const result = await register(userData);
    setSubmitting(false);
    
    if (result.success) {
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Kayıt sırasında bir hata oluştu.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.error);
    }
  };

  if (authLoading) {
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


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'var(--color-white-off)',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(112, 38, 185, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 20%)'
    }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Kayıt Ol
          </h1>
          <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem' }}>
            Epusula platformuna katılın
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              Ad Soyad
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                <User size={18} />
              </div>
              <input 
                id="name"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız ve Soyadınız"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-gray)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              E-posta Adresi
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                <Mail size={18} />
              </div>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@epusula.net"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-gray)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                <Lock size={18} />
              </div>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-gray)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="role" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              Hesap Türü
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                <BookOpen size={18} />
              </div>
              <select 
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-gray)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  appearance: 'none',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
              >
                <option value="student">Öğrenci</option>
                <option value="teacher">Öğretmen</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
          </div>

          {role === 'student' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="classId" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
                Sınıfınız
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                  <GraduationCap size={18} />
                </div>
                <select 
                  id="classId"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray)',
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    appearance: 'none',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-gray)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-black-light)' }}>veya</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-gray)' }}></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-outline" 
          style={{ 
            width: '100%', 
            padding: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            borderColor: 'var(--color-gray)',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google ile Kayıt Ol
        </button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-black-light)' }}>Zaten hesabınız var mı? </span>
          <Link to="/login" style={{ color: 'var(--color-purple)', fontWeight: 600, textDecoration: 'none' }}>
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
