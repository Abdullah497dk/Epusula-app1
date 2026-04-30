import React, { useState } from 'react';
import { PlusCircle, Search, Settings, BookOpen } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-black)', marginBottom: '0.25rem' }}>İçerik ve Kullanıcı Yönetimi</h2>
          <p style={{ color: 'var(--color-black-light)' }}>Sisteme Soru Ekle, Kullanıcıları Yönet.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <PlusCircle size={18} />
          Yeni Soru Ekle
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Manage Content Card */}
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-purple)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
              <BookOpen size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Soru Havuzu Yönetimi</h3>
          </div>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Konu veya ünite ara..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-gray)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ padding: '0.75rem', border: '1px solid var(--color-gray)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>Limit ve Süreklilik</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-black-light)' }}>12. Sınıf - 45 Soru Mevcut</p>
              </div>
              <button style={{ color: 'var(--color-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Düzenle</button>
            </div>
            <div style={{ padding: '0.75rem', border: '1px solid var(--color-gray)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>Türev Alma Kuralları</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-black-light)' }}>12. Sınıf - 30 Soru Mevcut</p>
              </div>
              <button style={{ color: 'var(--color-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Düzenle</button>
            </div>
          </div>
        </div>

        {/* Global Settings & Users Card */}
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-blue)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
              <Settings size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sistem ve Kullanıcılar</h3>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-black-light)', marginBottom: '1rem' }}>Platform üzerindeki kullanıcı yetkilendirmeleri ve Hostinger veritabanı ayarlarını buradan yapılandırabilirsiniz.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>Öğrenci Yönetimi</button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>Öğretmen Yönetimi</button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>Sınıf Atamaları</button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
