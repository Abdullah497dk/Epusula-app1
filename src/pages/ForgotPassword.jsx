import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setSubmitting(true);
    const res = await sendPasswordReset(email);
    setSubmitting(false);
    if (res.success) {
      setSent(true);
    } else {
      setError(res.error || 'E-posta gönderilemedi.');
    }
  };

  const cardWrap = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', backgroundColor: 'var(--color-white-off)',
    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(112, 38, 185, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 20%)'
  };

  if (sent) {
    return (
      <div style={cardWrap}>
        <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ color: '#22c55e', marginBottom: '0.75rem' }}><CheckCircle2 size={44} /></div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>E-posta Gönderildi</h1>
          <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            <strong>{email}</strong> adresine bir şifre sıfırlama bağlantısı gönderdik. Gelen kutunu
            (ve spam klasörünü) kontrol et; bağlantıya tıklayarak yeni şifreni belirleyebilirsin.
          </p>
          <Link to="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
            Girişe Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={cardWrap}>
      <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Şifremi Unuttum
          </h1>
          <p style={{ color: 'var(--color-black-light)', fontSize: '0.95rem' }}>
            E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              E-posta Adresi
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
                <Mail size={18} />
              </div>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@epusula.net"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)', fontFamily: 'var(--font-family)', fontSize: '0.95rem', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={submitting}>
            {submitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--color-purple)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={16} /> Girişe Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
