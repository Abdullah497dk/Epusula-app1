import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Activity, Target, AlertTriangle, Filter } from 'lucide-react';

const StatCards = ({ title, description, stats }) => (
  <div style={{ marginBottom: '3rem' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--color-black)', marginBottom: '0.25rem' }}>{title}</h2>
      <p style={{ color: 'var(--color-black-light)' }}>{description}</p>
    </div>

    {/* KPI Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--color-blue)' }}>
          <Users size={24} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Toplam Öğrenci</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stats.totalStudents}</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', color: '#22c55e' }}>
          <Activity size={24} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Aktif Öğrenciler</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            {stats.activeToday} 
            <span style={{ fontSize: '0.9rem', color: '#22c55e', fontWeight: 500, marginLeft: '0.5rem' }}>
              ({stats.totalStudents > 0 ? Math.round((stats.activeToday/stats.totalStudents)*100) : 0}%)
            </span>
          </p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(112, 38, 185, 0.1)', borderRadius: '50%', color: 'var(--color-purple)' }}>
          <Target size={24} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Ortalama Başarı</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>%{stats.averageSuccessRate}</p>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {/* Alerts / Insights Area */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray)', paddingBottom: '0.5rem' }}>Analizler</h3>
        
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Durum</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{stats.weakestUnit}</p>
        </div>

        <button className="btn btn-outline" style={{ width: '100%', marginTop: '1.5rem' }}>Rapor İndir</button>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray)', paddingBottom: '0.5rem' }}>Son Aktiviteler</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.recentActivity.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--color-black-light)' }}>Henüz aktivite yok.</p>
          ) : (
            stats.recentActivity.map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-purple-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {act.name.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{act.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-black-light)' }}>{act.action}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const { user, customClasses, allUsers } = useAuth();
  
  // Custom classes created by this teacher
  const myCreatedClasses = customClasses?.filter(c => c.teacherId === user?.id) || [];
  
  // Initialize with the first class or an empty string
  const [selectedClassId, setSelectedClassId] = useState('');

  // Helper to calculate stats for a given array of students
  const calculateStats = (studentList) => {
    const totalStudents = studentList.length;
    let totalAnswered = 0;
    let totalCorrect = 0;
    let activeToday = 0; // mock: if streak > 0, consider active today
    
    studentList.forEach(s => {
      if (s.stats) {
        totalAnswered += s.stats.totalAnswered || 0;
        totalCorrect += s.stats.correctAnswers || 0;
        if (s.stats.streak > 0) activeToday++;
      }
    });
    
    const averageSuccessRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      totalStudents,
      activeToday,
      averageSuccessRate,
      weakestUnit: totalStudents === 0 ? "Öğrenci Yok" : "Yeterli Veri Yok",
      recentActivity: studentList.slice(0, 3).map(s => ({
        userId: s.id,
        name: s.name,
        action: s.stats?.score > 0 ? "Soru çözdü" : "Sisteme kayıtlı"
      }))
    };
  };

  // 1. Calculate General Stats (All unique students across all my created classes)
  const generalStats = useMemo(() => {
    const allStudentIds = new Set();
    myCreatedClasses.forEach(c => {
      c.studentIds.forEach(id => allStudentIds.add(id));
    });
    const allMyStudents = allUsers.filter(u => allStudentIds.has(u.id));
    return calculateStats(allMyStudents);
  }, [myCreatedClasses, allUsers]);

  // 2. Calculate Selected Class Stats
  const selectedClass = myCreatedClasses.find(c => c.id === selectedClassId);
  const classStats = useMemo(() => {
    if (!selectedClass) return null;
    const classStudents = allUsers.filter(u => selectedClass.studentIds.includes(u.id));
    return calculateStats(classStudents);
  }, [selectedClass, allUsers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {myCreatedClasses.length > 0 ? (
        <>
          {/* ALWAYS SHOW GENERAL STATS AT THE TOP */}
          <StatCards 
            title="Genel Durum (Tüm Öğrenciler)" 
            description="Oluşturduğunuz tüm özel sınıflardaki öğrencilerin birleştirilmiş istatistikleri." 
            stats={generalStats} 
          />

          {/* DROPDOWN FOR SPECIFIC CLASSES */}
          <div style={{ borderTop: '2px dashed var(--color-gray)', paddingTop: '3rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-black)', margin: 0 }}>Sınıf Bazlı İnceleme</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-white)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-purple)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <Filter size={18} color="var(--color-purple)" />
                <select 
                  value={selectedClassId} 
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '1rem', fontWeight: 600, color: 'var(--color-purple)', cursor: 'pointer' }}
                >
                  <option value="" disabled>Sınıf Seçiniz</option>
                  {myCreatedClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SHOW SPECIFIC CLASS STATS IF SELECTED */}
            {selectedClass && classStats && (
              <div style={{ backgroundColor: 'rgba(112, 38, 185, 0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(112, 38, 185, 0.1)' }}>
                 <StatCards 
                  title={`${selectedClass.name} Sınıfı Durumu`} 
                  description="Seçtiğiniz sınıfın performans özeti." 
                  stats={classStats} 
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', color: 'var(--color-black-light)', border: '1px dashed var(--color-gray)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Users size={48} color="var(--color-gray)" />
          <div>
            <h2 style={{ color: 'var(--color-black)', marginBottom: '0.5rem' }}>Hoş Geldiniz</h2>
            <p>Henüz hiç özel sınıf oluşturmadınız. Sistemin istatistik özelliklerini kullanmak için "Sınıflarım" menüsünden yeni bir sınıf oluşturabilirsiniz.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;
