import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Check, X, Clock, Shield, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

import { Link } from 'react-router-dom';

const MyClasses = () => {
  const { 
    user, 
    customClasses, 
    joinRequests, 
    createCustomClass, 
    requestJoinClass, 
    handleJoinRequest, 
    allUsers,
    updateClassName,
    removeStudentFromClass
  } = useAuth();
  
  const [newClassName, setNewClassName] = useState('');
  const [searchClassId, setSearchClassId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClassForList, setSelectedClassForList] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [tempClassName, setTempClassName] = useState('');

  const isTeacher = user?.role === 'teacher';

  // TEACHER DATA
  const myCreatedClasses = customClasses.filter(c => c.teacherId === user?.id);
  const myClassIds = myCreatedClasses.map(c => c.id);
  const pendingRequestsToMe = joinRequests.filter(r => myClassIds.includes(r.classId) && r.status === 'pending');

  // STUDENT DATA
  const myJoinedClasses = customClasses.filter(c => c.studentIds.includes(user?.id));
  const myPendingRequests = joinRequests.filter(r => r.studentId === user?.id && r.status === 'pending');

  const handleCreateClass = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newClassName.trim()) {
      setError('Sınıf adı boş olamaz.');
      return;
    }
    const res = createCustomClass(newClassName);
    if (res.success) {
      setSuccess(`"${newClassName}" sınıfı oluşturuldu. Sınıf Kodu: ${res.class.id}`);
      setNewClassName('');
    } else {
      setError(res.error);
    }
  };

  const handleUpdateClassName = (classId) => {
    if (!tempClassName.trim()) return;
    updateClassName(classId, tempClassName);
    setEditingClassId(null);
    setSuccess('Sınıf adı güncellendi.');
  };

  const handleRemoveStudent = (classId, studentId) => {
    if (window.confirm(`${getStudentName(studentId)} adlı öğrenciyi sınıftan çıkarmak istediğinize emin misiniz?`)) {
      removeStudentFromClass(classId, studentId);
      setSuccess('Öğrenci sınıftan çıkarıldı.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearchResult(null);
    
    if (!searchClassId.trim()) return;
    
    const found = customClasses.find(c => c.id === searchClassId.trim().toUpperCase());
    if (found) {
      setSearchResult(found);
    } else {
      setError('Bu koda sahip bir sınıf bulunamadı.');
    }
  };

  const handleRequestJoin = (classId) => {
    setError('');
    setSuccess('');
    const res = requestJoinClass(classId);
    if (res.success) {
      setSuccess('Katılma isteği gönderildi. Öğretmenin onayı bekleniyor.');
      setSearchResult(null);
    } else {
      setError(res.error);
    }
  };

  const getStudentName = (studentId) => {
    return allUsers.find(u => u.id === studentId)?.name || 'Bilinmeyen Öğrenci';
  };

  const getClassName = (classId) => {
    return customClasses.find(c => c.id === classId)?.name || 'Bilinmeyen Sınıf';
  };

  const toggleStudentList = (classId) => {
    if (selectedClassForList === classId) {
      setSelectedClassForList(null);
    } else {
      setSelectedClassForList(classId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      <div className="card glass" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        color: 'var(--color-white)',
        border: 'none',
        padding: '1.25rem'
      }}>
        <Users size={32} color="#fcd34d" />
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem', color: 'white' }}>Özel Sınıflarım</h2>
          <p style={{ opacity: 0.9, fontSize: '0.85rem' }}>
            {isTeacher ? 'Sınıflarınızı yönetin ve öğrencilerinizi takip edin.' : 'Özel sınıflara katılın ve yarışın.'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 'var(--radius-md)', border: '1px solid #22c55e' }}>
          {success}
        </div>
      )}

      {isTeacher ? (
        <>
          {/* TEACHER VIEW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--color-purple)" />
                Yeni Sınıf Oluştur
              </h3>
              <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Sınıf Adı (örn: YKS Kampı)" 
                  className="input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)' }}
                />
                <button type="submit" className="btn btn-primary">Oluştur</button>
              </form>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="var(--color-blue)" />
                Bekleyen İstekler ({pendingRequestsToMe.length})
              </h3>
              {pendingRequestsToMe.length === 0 ? (
                <p style={{ color: 'var(--color-black-light)' }}>Şu an bekleyen istek yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingRequestsToMe.map(req => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{getStudentName(req.studentId)}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-black-light)' }}>{getClassName(req.classId)} sınıfına katılmak istiyor.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleJoinRequest(req.id, 'accepted')} style={{ color: '#22c55e', padding: '0.25rem' }}><Check size={20} /></button>
                        <button onClick={() => handleJoinRequest(req.id, 'rejected')} style={{ color: '#ef4444', padding: '0.25rem' }}><X size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Yönettiğim Sınıflar</h3>
            {myCreatedClasses.length === 0 ? (
              <p style={{ color: 'var(--color-black-light)' }}>Henüz hiç sınıf oluşturmadınız.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myCreatedClasses.map(c => (
                  <div key={c.id} style={{ padding: '1.25rem', border: '1px solid var(--color-gray)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        {editingClassId === c.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={tempClassName} 
                              onChange={(e) => setTempClassName(e.target.value)}
                              className="input"
                              style={{ padding: '0.4rem', fontSize: '0.95rem' }}
                            />
                            <button onClick={() => handleUpdateClassName(c.id)} style={{ color: '#22c55e' }}><Check size={18} /></button>
                            <button onClick={() => setEditingClassId(null)} style={{ color: '#ef4444' }}><X size={18} /></button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-purple)' }}>{c.name}</h4>
                            <button 
                              onClick={() => {
                                setEditingClassId(c.id);
                                setTempClassName(c.name);
                              }}
                              style={{ color: 'var(--color-black-light)', opacity: 0.6, padding: '2px' }}
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-black-light)', marginTop: '0.25rem' }}>Sınıf Kodu: <strong style={{ color: 'var(--color-black)' }}>{c.id}</strong></p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          onClick={() => toggleStudentList(c.id)}
                          className={`btn ${selectedClassForList === c.id ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          {selectedClassForList === c.id ? <EyeOff size={16} /> : <Eye size={16} />}
                          {selectedClassForList === c.id ? 'Kapat' : 'İncele'}
                        </button>
                        <Link 
                          to={`/leaderboard?classId=${c.id}`} 
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          Sınıf Sıralaması
                        </Link>
                      </div>
                    </div>
                    
                    {selectedClassForList === c.id && (
                      <div style={{ borderTop: '1px solid var(--color-gray)', paddingTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Öğrenciler ({c.studentIds.length})</p>
                        {c.studentIds.length === 0 ? (
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)' }}>Henüz kayıtlı öğrenci yok.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {c.studentIds.map(studentId => (
                              <div key={studentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{getStudentName(studentId)}</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <Link 
                                    to={`/student-stats/${studentId}`} 
                                    className="btn btn-primary"
                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                                  >
                                    İstatistikler
                                  </Link>
                                  <button 
                                    onClick={() => handleRemoveStudent(c.id, studentId)}
                                    title="Sınıftan Çıkar"
                                    style={{ color: '#ef4444', padding: '0.4rem', opacity: 0.7 }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* STUDENT VIEW */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} color="var(--color-blue)" />
              Sınıf Kodunu Gir
            </h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={searchClassId}
                onChange={(e) => setSearchClassId(e.target.value.toUpperCase())}
                placeholder="Örn: X7A9B" 
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)' }}
              />
              <button type="submit" className="btn btn-accent">Ara</button>
            </form>
            
            {searchResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--color-purple)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(112, 38, 185, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--color-black)' }}>{searchResult.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)' }}>Öğretmen: {getStudentName(searchResult.teacherId)}</p>
                </div>
                {searchResult.studentIds.includes(user?.id) ? (
                  <span className="badge" style={{ backgroundColor: '#22c55e' }}>Kayıtlısınız</span>
                ) : (
                  <button onClick={() => handleRequestJoin(searchResult.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Katılma İsteği Gönder</button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Kayıtlı Olduğum Sınıflar</h3>
              {myJoinedClasses.length === 0 ? (
                <p style={{ color: 'var(--color-black-light)' }}>Henüz hiçbir özel sınıfa katılmadınız.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {myJoinedClasses.map(c => (
                    <div key={c.id} style={{ padding: '1.25rem', border: '1px solid var(--color-gray)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-blue)' }}>{c.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)' }}>Öğretmen: {getStudentName(c.teacherId)}</p>
                        </div>
                        <button 
                          onClick={() => toggleStudentList(c.id)}
                          className={`btn ${selectedClassForList === c.id ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          {selectedClassForList === c.id ? <EyeOff size={16} /> : <Eye size={16} />}
                          {selectedClassForList === c.id ? 'Kapat' : 'İncele'}
                        </button>
                      </div>

                      {selectedClassForList === c.id && (
                        <div style={{ borderTop: '1px solid var(--color-gray)', paddingTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sınıf Arkadaşlarım ({c.studentIds.length})</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {c.studentIds.map(studentId => (
                              <div key={studentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                  {getStudentName(studentId)} {studentId === user.id ? '(Sen)' : ''}
                                </span>
                                <Link 
                                  to={`/student-stats/${studentId}`} 
                                  className="btn btn-primary"
                                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem' }}
                                >
                                  Bilgiler
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {myPendingRequests.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} color="#f59e0b" />
                  Bekleyen İsteklerim
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {myPendingRequests.map(req => (
                    <div key={req.id} style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#b45309' }}>{getClassName(req.classId)}</p>
                      <p style={{ fontSize: '0.8rem', color: '#d97706' }}>Onay bekleniyor...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyClasses;
