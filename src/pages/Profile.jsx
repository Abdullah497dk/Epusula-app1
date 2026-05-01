import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, BookOpen, Camera, Hash, GraduationCap } from 'lucide-react';
import { classes } from '../data/mockData';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  // Adding additional profile info fields
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!name || !email) {
      setMessage({ text: 'Ad Soyad ve E-posta zorunludur.', type: 'error' });
      return;
    }

    const result = updateProfile({ name, email, bio, phone, profilePic });
    if (result.success) {
      setMessage({ text: 'Profiliniz başarıyla güncellendi.', type: 'success' });
    } else {
      setMessage({ text: result.error || 'Bir hata oluştu.', type: 'error' });
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'student': return 'Öğrenci';
      case 'teacher': return 'Öğretmen';
      case 'admin': return 'Yönetici';
      default: return role;
    }
  };

  const getClassName = (classId) => {
    return classes.find(c => c.id === classId)?.name || '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'Fotoğraf boyutu 2MB dan küçük olmalıdır.', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-black)' }}>
        Profilim
      </h2>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-purple-light)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              overflow: 'hidden',
              border: '4px solid var(--color-white)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} />
              )}
            </div>
            <label 
              htmlFor="profile-upload" 
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: 'var(--color-purple)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid white',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Camera size={16} />
            </label>
            <input 
              id="profile-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ display: 'none' }} 
            />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>{user?.name}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-purple)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(112,38,185,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                <BookOpen size={14} />
                {getRoleName(user?.role)}
              </span>
              
              {user?.role === 'student' && user?.classId && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-blue)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  <GraduationCap size={14} />
                  {getClassName(user.classId)}
                </span>
              )}
              
              {user?.role === 'student' && user?.studentNo && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-gray-dark)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'var(--color-white-off)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-gray)' }}>
                  <Hash size={14} />
                  Öğrenci No: {user.studentNo}
                </span>
              )}
            </div>
          </div>
        </div>

        {message.text && (
          <div style={{ 
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
            color: message.type === 'success' ? '#166534' : '#b91c1c', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
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
            <label htmlFor="phone" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              Telefon Numarası
            </label>
            <input 
              id="phone"
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="bio" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)' }}>
              Hakkımda (Bio)
            </label>
            <textarea 
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendinizden bahsedin..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-gray)',
                fontFamily: 'var(--font-family)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-purple)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-gray)'}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
            <Save size={18} />
            Değişiklikleri Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
