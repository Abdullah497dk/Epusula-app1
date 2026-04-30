import React from 'react';
import { useAuth } from '../context/AuthContext';
import { classStats, classes } from '../data/mockData';
import { Users, Activity, Target, AlertTriangle } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  // For Teacher view, assuming they have access to class-12 stats primarily for the mock
  const stats = classStats["class-12"];
  const className = classes.find(c => c.id === "class-12")?.name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-black)', marginBottom: '0.25rem' }}>{className} - Genel Durum</h2>
        <p style={{ color: 'var(--color-black-light)' }}>Sınıfınızın günlük istatistik ve katılım oranları.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
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
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Bugün Katılanlar</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stats.activeToday} <span style={{ fontSize: '0.9rem', color: '#22c55e', fontWeight: 500 }}>({Math.round((stats.activeToday/stats.totalStudents)*100)}%)</span></p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Alerts / Insights Area */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray)', paddingBottom: '0.5rem' }}>Analizler</h3>
          
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.5rem' }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>En Zorlanılan Ünite</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{stats.weakestUnit}</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-black-light)' }}>Öğrencilerin %60'ı bu ünitedeki 3. soruyu yanlış cevapladı.</p>
          </div>

          <button className="btn btn-outline" style={{ width: '100%', marginTop: '1.5rem' }}>Rapor İndir</button>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray)', paddingBottom: '0.5rem' }}>Son Aktiviteler</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivity.map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-purple-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {act.name.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{act.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-black-light)' }}>{act.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default TeacherDashboard;
