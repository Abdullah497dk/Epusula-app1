import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import { classes } from '../data/mockData';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [classId, setClassId] = useState('class-6'); // Default to class-6
  const [error, setError] = useState('');
  
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    // Simulate sending an email
    alert(`E-posta doğrulama kodunuz: ${code}\n\n(Bu mesaj, test ortamında olduğumuz için e-posta yerine gösterilmektedir.)`);
    
    setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (verificationCode !== generatedCode) {
      setError('Hatalı doğrulama kodu. Lütfen tekrar deneyin.');
      return;
    }

    const userData = { name, email, password, role };
    if (role === 'student') {
      userData.classId = classId;
    }

    const result = register(userData);
    
    if (result.success) {
      if (result.role === 'student') navigate('/student/dashboard');
      else if (result.role === 'teacher') navigate('/teacher/dashboard');
      else if (result.role === 'admin') navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
  };

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
            {step === 1 ? 'Kayıt Ol' : 'Hesabı Doğrula'}
          </h1>
          <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem' }}>
            {step === 1 ? 'Epusula platformuna katılın' : `${email} adresine gönderilen kodu girin`}
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

        {step === 1 ? (
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
              İleri
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="verificationCode" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
                Doğrulama Kodu
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                  <ShieldCheck size={18} />
                </div>
                <input 
                  id="verificationCode"
                  type="text" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6 haneli kodu girin"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray)',
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    letterSpacing: '0.2em',
                    textAlign: 'center'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '0.85rem' }}
              >
                Geri Dön
              </button>
              <button type="submit" className="btn btn-accent" style={{ flex: 1, padding: '0.85rem' }}>
                Doğrula ve Kayıt Ol
              </button>
            </div>
          </form>
        )}

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
