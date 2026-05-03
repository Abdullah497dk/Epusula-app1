import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Search, User, X } from 'lucide-react';
import { classes } from '../data/mockData';

const Leaderboard = () => {
  const { user, allUsers } = useAuth();
  const [viewMode, setViewMode] = useState('global'); // 'global' or 'class'
  const [selectedProfile, setSelectedProfile] = useState(null);

  const getClassName = (classId) => {
    return classes.find(c => c.id === classId)?.name || 'Bilinmiyor';
  };

  const rankedUsers = useMemo(() => {
    let filteredUsers = allUsers.filter(u => u.role === 'student');
    
    if (viewMode === 'class' && user?.classId) {
      filteredUsers = filteredUsers.filter(u => u.classId === user.classId);
    }
    
    // Sort by score descending, then by totalAnswered descending
    return filteredUsers.sort((a, b) => {
      const scoreA = a.stats?.score || 0;
      const scoreB = b.stats?.score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      const totalA = a.stats?.totalAnswered || 0;
      const totalB = b.stats?.totalAnswered || 0;
      return totalB - totalA;
    });
  }, [allUsers, viewMode, user]);

  const topUsers = rankedUsers.slice(0, 50);

  const myRank = useMemo(() => {
    if (!user || user.role !== 'student') return null;
    const index = rankedUsers.findIndex(u => u.id === user.id);
    return index !== -1 ? index + 1 : null;
  }, [rankedUsers, user]);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header Banner */}
      <div className="card glass" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        color: 'var(--color-white)',
        border: 'none',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Trophy size={36} color="#fcd34d" />
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'white' }}>Liderlik Tablosu</h2>
            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Epusula Şampiyonları</p>
          </div>
        </div>
        
        {user?.role === 'student' && myRank && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
              {viewMode === 'global' ? 'Genel Sıralaman' : 'Sınıf Sıralaman'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>#{myRank}</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>({user.stats?.score || 0} Puan)</span>
            </div>
          </div>
        )}
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setViewMode('global')}
          className={`btn ${viewMode === 'global' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1 }}
        >
          Genel Sıralama
        </button>
        {user?.role === 'student' && user?.classId && (
          <button 
            onClick={() => setViewMode('class')}
            className={`btn ${viewMode === 'class' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            Sınıf Sıralaması ({getClassName(user.classId)})
          </button>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-white-off)', borderBottom: '1px solid var(--color-gray)' }}>
              <th style={{ padding: '1rem', textAlign: 'center', width: '60px' }}>#</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Öğrenci</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Sınıf</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Puan</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-black-light)' }}>
                  Henüz kimse puan kazanmamış.
                </td>
              </tr>
            ) : (
              topUsers.map((u, index) => (
                <tr key={u.id} style={{ 
                  borderBottom: '1px solid var(--color-gray)',
                  backgroundColor: u.id === user?.id ? 'rgba(112, 38, 185, 0.05)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: index < 3 ? 'var(--color-purple)' : 'var(--color-black)' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                      {u.profilePic ? <img src={u.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <User size={18} color="var(--color-black-light)" />}
                    </div>
                    <span style={{ fontWeight: u.id === user?.id ? 700 : 500, color: 'var(--color-black)' }}>
                      {u.name} {u.id === user?.id && '(Sen)'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-black-light)', fontSize: '0.9rem' }}>
                    {getClassName(u.classId)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-blue)' }}>
                    {u.stats?.score || 0}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedProfile(u)}
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Profile Bak
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Public Profile Modal */}
      {selectedProfile && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedProfile(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-black-light)' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '1rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem', color: 'white'
              }}>
                {selectedProfile.profilePic ? <img src={selectedProfile.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <User size={40} />}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{selectedProfile.name}</h3>
              <p style={{ color: 'var(--color-purple)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {getClassName(selectedProfile.classId)}
              </p>

              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <div style={{ flex: 1, backgroundColor: 'var(--color-white-off)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-black-light)', marginBottom: '0.25rem' }}>Puan</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-blue)', margin: 0 }}>{selectedProfile.stats?.score || 0}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--color-white-off)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-black-light)', marginBottom: '0.25rem' }}>Seri (Gün)</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>{selectedProfile.stats?.streak || 0} 🔥</p>
                </div>
              </div>

              {selectedProfile.bio && (
                <div style={{ marginTop: '1.5rem', width: '100%', textAlign: 'left', borderTop: '1px solid var(--color-gray)', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-black-light)', marginBottom: '0.5rem' }}>Hakkında</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-black)', lineHeight: 1.5 }}>{selectedProfile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
