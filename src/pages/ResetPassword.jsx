import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const { updatePassword, clearPasswordRecovery, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setSubmitting(true);
    const res = await updatePassword(password);
    setSubmitting(false);
    if (res.success) {
      setDone(true);
    } else {
      setError(res.error || 'Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.');
    }
  };

  const goToLogin = async () => {
    clearPasswordRecovery();
    await logout();
    navigate('/login');
  };

  const cardWrap = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', backgroundColor: 'var(--color-white-off)',
    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(112, 38, 185, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 20%)'
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)', fontFamily: 'var(--font-family)', fontSize: '0.95rem', outline: 'none' };

  if (done) {
    return (
      <div style={cardWrap}>
        <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ color: '#22c55e', marginBottom: '0.75rem' }}><CheckCircle2 size={44} /></div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Şifren Güncellendi</h1>
          <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Yeni şifrenle giriş yapabilirsin.
          </p>
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} onClick={goToLogin}>
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={cardWrap}>
      <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Yeni Şifre Belirle
          </h1>
          <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem' }}>
            Hesabın için yeni bir şifre oluştur.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>Yeni Şifre</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}><Lock size={18} /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'} onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>Yeni Şifre (Tekrar)</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}><Lock size={18} /></div>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'} onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={submitting}>
            {submitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
