import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Activity, Award } from 'lucide-react';

const StudentStats = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { allUsers } = useAuth();

  const student = allUsers.find(u => u.id === studentId);

  if (!student) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Öğrenci bulunamadı.</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Geri Dön</button>
      </div>
    );
  }

  const { stats } = student;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Öğrenci İstatistikleri</h2>
      </div>

      <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {student.profilePic ? <img src={student.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <User size={40} color="var(--color-black-light)" />}
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>{student.name}</h3>
          <p style={{ color: 'var(--color-black-light)', margin: 0 }}>Öğrenci No: {student.studentNo || '-'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--color-blue)' }}>
            <Award size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Toplam Puan</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stats?.score || 0}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', color: '#22c55e' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Çözülen Soru</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stats?.totalAnswered || 0}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: '#f59e0b' }}>
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>Seri</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stats?.streak || 0} Gün</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Detaylı Analiz (Gelecekte)</h3>
        <p style={{ color: 'var(--color-black-light)' }}>
          Buraya ileride öğrencinin ünite bazlı başarı oranları, zayıf olduğu konular ve gelişim grafikleri eklenecektir.
        </p>
      </div>
    </div>
  );
};

export default StudentStats;
