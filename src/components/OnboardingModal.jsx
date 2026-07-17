import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, BookOpen, Shield, User, ArrowRight } from 'lucide-react';
import { classes } from '../data/mockData';
import './onboarding.css';

const OnboardingModal = () => {
  const { user, updateProfile } = useAuth();
  
  // Set initial name from user if available
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState('student');
  const [classId, setClassId] = useState('class-6');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Lütfen adınızı ve soyadınızı girin.');
      return;
    }

    setLoading(true);
    const updatedFields = {
      name: name.trim(),
      role: role
    };

    if (role === 'student') {
      updatedFields.classId = classId;
    } else {
      updatedFields.classId = null;
    }

    const res = await updateProfile(updatedFields);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Profil güncellenirken bir hata oluştu.');
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="logo-sparkle">✨</div>
          <h2>Epusula'ya Hoş Geldiniz</h2>
          <p>Lütfen platformu kullanmaya başlamak için bilgilerinizi tamamlayın.</p>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label htmlFor="name-input">Adınız ve Soyadınız</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ad Soyad"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Hesap Türünüzü Seçin</label>
            <div className="role-cards">
              <div 
                className={`role-card ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <div className="role-icon-wrapper student">
                  <GraduationCap size={24} />
                </div>
                <div className="role-details">
                  <h4>Öğrenci</h4>
                  <p>Derslerine çalış, günlük testleri çöz ve puanları topla!</p>
                </div>
              </div>

              <div 
                className={`role-card ${role === 'teacher' ? 'active' : ''}`}
                onClick={() => setRole('teacher')}
              >
                <div className="role-icon-wrapper teacher">
                  <BookOpen size={24} />
                </div>
                <div className="role-details">
                  <h4>Öğretmen</h4>
                  <p>Sınıflar oluştur, öğrencilerinin gelişimini ve serilerini takip et.</p>
                </div>
              </div>

              <div 
                className={`role-card ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                <div className="role-icon-wrapper admin">
                  <Shield size={24} />
                </div>
                <div className="role-details">
                  <h4>Yönetici</h4>
                  <p>Genel sistem ayarlarını yap ve tüm verileri izle.</p>
                </div>
              </div>
            </div>
          </div>

          {role === 'student' && (
            <div className="form-group animate-slide-up">
              <label htmlFor="class-select">Sınıfınız</label>
              <div className="input-wrapper">
                <GraduationCap size={18} className="input-icon" />
                <select
                  id="class-select"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="onboarding-submit-btn" disabled={loading}>
            {loading ? 'Tamamlanıyor...' : 'Devam Et'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
