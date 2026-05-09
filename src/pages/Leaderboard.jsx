import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Search, User, X } from 'lucide-react';
import { classes } from '../data/mockData';
import { useLocation } from 'react-router-dom';

const Leaderboard = () => {
  const { user, allUsers, customClasses } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialClassId = queryParams.get('classId');
  
  const [viewMode, setViewMode] = useState(initialClassId || 'global'); // 'global', 'main_class', or customClass.id
  const [selectedProfile, setSelectedProfile] = useState(null);

  // If query params change (e.g., user navigated to a different class leaderboard)
  useEffect(() => {
    if (initialClassId) {
      setViewMode(initialClassId);
    }
  }, [initialClassId]);

  const getClassName = (classId) => {
    return classes.find(c => c.id === classId)?.name || 'Bilinmiyor';
  };

  const myJoinedClasses = useMemo(() => {
    if (user?.role === 'student') {
      return customClasses?.filter(c => c.studentIds.includes(user.id)) || [];
    } else if (user?.role === 'teacher') {
      return customClasses?.filter(c => c.teacherId === user.id) || [];
    }
    return [];
  }, [customClasses, user]);

  const rankedUsers = useMemo(() => {
    let filteredUsers = allUsers.filter(u => u.role === 'student');
    
    if (viewMode === 'main_class' && user?.classId) {
      filteredUsers = filteredUsers.filter(u => u.classId === user.classId);
    } else if (viewMode !== 'global') {
      // Must be a custom class ID
      const targetClass = customClasses?.find(c => c.id === viewMode);
      if (targetClass) {
        filteredUsers = filteredUsers.filter(u => targetClass.studentIds.includes(u.id));
      }
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
  }, [allUsers, viewMode, user, customClasses]);

  const topUsers = rankedUsers.slice(0, 50);

  const myRank = useMemo(() => {
    if (!user || user.role !== 'student') return null;
    const index = rankedUsers.findIndex(u => u.id === user.id);
    return index !== -1 ? index + 1 : null;
  }, [rankedUsers, user]);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header Banner */}
      <div className="card glass leaderboard-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        color: 'var(--color-white)',
        border: 'none',
        marginBottom: '1.5rem',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Trophy size={32} color="#fcd34d" />
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem', color: 'white' }}>Liderlik Tablosu</h2>
            <p style={{ opacity: 0.9, fontSize: '0.85rem' }}>Epusula Şampiyonları</p>
          </div>
        </div>
        
        {user?.role === 'student' && myRank && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
              {viewMode === 'global' ? 'Genel Sıra' : viewMode === 'main_class' ? 'Sınıf Sıran' : 'Özel Sınıf Sıran'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>#{myRank}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>({user.stats?.score || 0})</span>
            </div>
          </div>
        )}
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setViewMode('global')}
          className={`btn ${viewMode === 'global' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flexShrink: 0 }}
        >
          Genel Sıralama
        </button>
        {user?.role === 'student' && user?.classId && (
          <button 
            onClick={() => setViewMode('main_class')}
            className={`btn ${viewMode === 'main_class' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flexShrink: 0 }}
          >
            {getClassName(user.classId)}
          </button>
        )}
        {myJoinedClasses.map(c => (
          <button 
            key={c.id}
            onClick={() => setViewMode(c.id)}
            className={`btn ${viewMode === c.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ flexShrink: 0 }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '350px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-white-off)', borderBottom: '1px solid var(--color-gray)' }}>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'center', width: '50px' }}>#</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Öğrenci</th>
                <th className="hide-mobile" style={{ padding: '1rem', textAlign: 'center' }}>Sınıf</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Puan</th>
                <th style={{ padding: '1rem', textAlign: 'center', width: '100px' }}>Aksiyon</th>
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
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 700, color: index < 3 ? 'var(--color-purple)' : 'var(--color-black)', fontSize: '1.1rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="hide-mobile" style={{
                        width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                      }}>
                        {u.profilePic ? <img src={u.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <User size={18} color="var(--color-black-light)" />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: u.id === user?.id ? 700 : 500, color: 'var(--color-black)', fontSize: '0.95rem' }}>
                          {u.name} {u.id === user?.id && '(Sen)'}
                        </span>
                        <span className="show-mobile" style={{ fontSize: '0.75rem', color: 'var(--color-black-light)' }}>
                          {getClassName(u.classId)}
                        </span>
                      </div>
                    </td>
                    <td className="hide-mobile" style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-black-light)', fontSize: '0.9rem' }}>
                      {getClassName(u.classId)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-blue)', fontSize: '1.05rem' }}>
                      {u.stats?.score || 0}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedProfile(u)}
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', fontSize: '0.7rem', minWidth: '60px' }}
                      >
                        <span className="hide-mobile">Profile Bak</span>
                        <User className="show-mobile" size={16} style={{ margin: '0 auto' }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
