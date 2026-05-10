import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Target, Activity, Flame, Calendar as CalendarIcon, TrendingUp, BookOpen } from 'lucide-react';
import { units } from '../data/mockData';

// Weekly Trends Component (Line Chart)
const WeeklyTrends = ({ activityLog }) => {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  
  // Calculate current week data
  const weeklyData = useMemo(() => {
    const data = new Array(7).fill(0);
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    
    // Get the date of the Sunday of the current week
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - currentDay);
    firstDayOfWeek.setHours(0, 0, 0, 0);

    if (activityLog) {
      activityLog.forEach(log => {
        if (log.type === 'test_completed') {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          
          const diffTime = logDate - firstDayOfWeek;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
            data[diffDays] += log.count || 0;
          }
        }
      });
    }
    return data;
  }, [activityLog]);

  const maxVal = Math.max(...weeklyData, 5); // Minimum scale of 5
  const dailyAverage = (weeklyData.reduce((a, b) => a + b, 0) / 7).toFixed(1);

  // SVG Chart Dimensions
  const width = 500;
  const height = 200;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate points for the SVG path
  const points = weeklyData.map((val, i) => {
    const x = padding + (i * (chartWidth / 6));
    const y = height - padding - (val / maxVal) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Area path points (close the path to the bottom)
  const areaPoints = `
    ${padding},${height - padding} 
    ${points} 
    ${width - padding},${height - padding}
  `;

  return (
    <div className="card" style={{ backgroundColor: '#1a1a1a', color: '#fff', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#3b82f6" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Haftalık Değerlendirme</h3>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6 }}>Günlük Ortalama Doğru</p>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{dailyAverage}</p>
      </div>

      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + i * (chartHeight / 4);
            return (
              <line 
                key={i} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#ffffff10" 
                strokeDasharray="4"
              />
            );
          })}

          {/* Area Fill */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#gradient)" />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {weeklyData.map((val, i) => {
            const x = padding + (i * (chartWidth / 6));
            const y = height - padding - (val / maxVal) * chartHeight;
            return (
              <circle 
                key={i} 
                cx={x} 
                cy={y} 
                r="4" 
                fill="#fff" 
                stroke="#3b82f6" 
                strokeWidth="2" 
              />
            );
          })}

          {/* X-axis labels */}
          {days.map((day, i) => {
            const x = padding + (i * (chartWidth / 6));
            return (
              <text 
                key={i} 
                x={x} 
                y={height - 5} 
                textAnchor="middle" 
                fill="#ffffff60" 
                fontSize="12"
              >
                {day}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Contribution Graph Component
const ContributionGraph = ({ activityLog }) => {
  // Determine current academic year (Starts in August)
  const today = new Date();
  const currentYear = today.getFullYear();
  const isAfterAugust = today.getMonth() >= 7; // 0-indexed, 7 is August
  const startYear = isAfterAugust ? currentYear : currentYear - 1;
  const startDate = new Date(startYear, 7, 1); // August 1st
  
  // Create an array of days for the grid (approx 52 weeks * 7 days)
  // Let's go up to July 31st of the next year
  const endDate = new Date(startYear + 1, 6, 31);
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // Group activities by date string "YYYY-MM-DD"
  const activityMap = useMemo(() => {
    const map = {};
    if (activityLog) {
      activityLog.forEach(log => {
        if (log.type === 'test_completed') {
          const dateStr = log.date.split('T')[0];
          map[dateStr] = (map[dateStr] || 0) + log.count;
        }
      });
    }
    // Mock some data for demonstration if empty or sparse
    // In a real app, this would be fetched from the backend
    if (Object.keys(map).length < 5) {
      const mockToday = new Date();
      for (let i = 0; i < 40; i++) {
        const d = new Date(mockToday);
        d.setDate(d.getDate() - Math.floor(Math.random() * 60));
        const dateStr = d.toISOString().split('T')[0];
        if (!map[dateStr]) {
          map[dateStr] = Math.floor(Math.random() * 4); // 0 to 3 questions
        }
      }
    }
    return map;
  }, [activityLog]);

  // Generate grid structure
  // The grid is a flex container with columns (weeks), each containing up to 7 day blocks
  const weeks = [];
  let currentWeek = [];
  
  // Align first day to Sunday (0) for the calendar layout
  let currentDay = new Date(startDate);
  while (currentDay.getDay() !== 0) {
    currentDay.setDate(currentDay.getDate() - 1);
  }

  while (currentDay <= endDate) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    const dateStr = currentDay.toISOString().split('T')[0];
    const isOutOfRange = currentDay < startDate || currentDay > endDate;
    const isFuture = currentDay > today;
    
    let count = 0;
    if (!isOutOfRange && !isFuture) {
      count = activityMap[dateStr] || 0;
    }

    currentWeek.push({
      date: new Date(currentDay),
      dateStr,
      count,
      isOutOfRange,
      isFuture
    });
    
    currentDay.setDate(currentDay.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get color based on activity count
  const getColor = (count, isOutOfRange, isFuture) => {
    if (isOutOfRange || isFuture) return 'transparent';
    if (count === 0) return 'var(--color-gray)';
    if (count === 1) return '#86efac'; // light green
    if (count === 2) return '#4ade80'; // medium green
    if (count >= 3) return '#16a34a'; // dark green
    return 'var(--color-gray)';
  };

  const months = ['Ağu', 'Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem'];

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={20} color="var(--color-purple)" />
          {startYear}-{startYear + 1} Eğitim Yılı Aktivitesi
        </h3>
      </div>
      
      <div style={{ 
        overflowX: 'auto', 
        padding: '1rem', 
        backgroundColor: 'var(--color-white-off)', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-gray)'
      }}>
        {/* Month Labels */}
        <div style={{ display: 'flex', marginLeft: '30px', marginBottom: '0.5rem', minWidth: '800px' }}>
          {months.map((m, i) => (
            <div key={i} style={{ flex: 1, fontSize: '0.8rem', color: 'var(--color-black-light)' }}>
              {m}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', minWidth: '800px' }}>
          {/* Day Labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '18px', paddingRight: '8px', fontSize: '0.75rem', color: 'var(--color-black-light)' }}>
            <span style={{ height: '14px', lineHeight: '14px' }}></span>
            <span style={{ height: '14px', lineHeight: '14px' }}>Pzt</span>
            <span style={{ height: '14px', lineHeight: '14px' }}></span>
            <span style={{ height: '14px', lineHeight: '14px' }}>Çar</span>
            <span style={{ height: '14px', lineHeight: '14px' }}></span>
            <span style={{ height: '14px', lineHeight: '14px' }}>Cum</span>
            <span style={{ height: '14px', lineHeight: '14px' }}></span>
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {weeks.map((week, wIndex) => (
              <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((day, dIndex) => (
                  <div 
                    key={dIndex}
                    title={!day.isOutOfRange && !day.isFuture ? `${day.date.toLocaleDateString('tr-TR')}: ${day.count} doğru` : ''}
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: getColor(day.count, day.isOutOfRange, day.isFuture),
                      borderRadius: '2px',
                      border: day.isOutOfRange || day.isFuture ? 'none' : '1px solid rgba(0,0,0,0.05)',
                      transition: 'transform 0.1s',
                      cursor: !day.isOutOfRange && !day.isFuture ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (!day.isOutOfRange && !day.isFuture) {
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!day.isOutOfRange && !day.isFuture) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-black-light)' }}>
          <span>Daha az</span>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-gray)', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', backgroundColor: '#86efac', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '12px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
          <span>Daha fazla</span>
        </div>
      </div>
    </div>
  );
};

// Topic Analysis Component
const TopicAnalysis = ({ activityLog }) => {
  const analysis = useMemo(() => {
    // Collect last 15 questions per unit
    const unitQuestions = {};
    
    if (activityLog) {
      // activityLog is ordered newest to oldest
      activityLog.forEach(log => {
        if (log.type === 'test_completed' && log.details) {
          log.details.forEach(detail => {
            if (!unitQuestions[detail.unitId]) {
              unitQuestions[detail.unitId] = [];
            }
            if (unitQuestions[detail.unitId].length < 15) {
              unitQuestions[detail.unitId].push(detail.isCorrect);
            }
          });
        }
      });
    }

    // Calculate percentages
    const results = [];
    Object.keys(unitQuestions).forEach(unitId => {
      const qList = unitQuestions[unitId];
      if (qList.length > 0) {
        const correctCount = qList.filter(c => c).length;
        const total = qList.length;
        const percentage = Math.round((correctCount / total) * 100);
        
        // Find unit name
        const unitName = units.find(u => u.id === unitId)?.name || 'Bilinmeyen Ünite';
        
        results.push({
          unitId,
          unitName,
          percentage,
          correctCount,
          total
        });
      }
    });

    // Sort by percentage ascending
    return results.sort((a, b) => a.percentage - b.percentage);
  }, [activityLog]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <BookOpen size={20} color="var(--color-purple)" />
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-black)' }}>Konu Analizi (Son 15 Soru)</h3>
      </div>
      
      {analysis.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-black-light)', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-md)' }}>
          Henüz yeterli veri yok. Test çözdükçe ünite analizlerin burada görünecektir.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {analysis.map((item) => (
            <div key={item.unitId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-black)' }}>{item.unitName}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: item.percentage >= 70 ? '#22c55e' : item.percentage >= 40 ? '#f59e0b' : '#ef4444' }}>
                  %{item.percentage} ({item.correctCount}/{item.total})
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-gray)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${item.percentage}%`, 
                  backgroundColor: item.percentage >= 70 ? '#22c55e' : item.percentage >= 40 ? '#f59e0b' : '#ef4444',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MyStats = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'student') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Bu sayfayı görüntüleme yetkiniz yok.</h2>
      </div>
    );
  }

  const { stats, activityLog } = user;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--color-black)' }}>İstatistiklerim</h2>
        <p style={{ color: 'var(--color-black-light)', marginTop: '0.5rem' }}>Eğitim sürecindeki detaylı analizlerini buradan takip edebilirsin.</p>
      </div>

      {/* Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--color-blue)' }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam Puan</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--color-black)' }}>{stats?.score || 0}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', color: '#22c55e' }}>
            <Target size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Çözülen Soru</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--color-black)' }}>{stats?.totalAnswered || 0}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: '#f59e0b' }}>
            <Flame size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mevcut Seri</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--color-black)' }}>{stats?.streak || 0} Gün</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(112, 38, 185, 0.1)', borderRadius: '50%', color: 'var(--color-purple)' }}>
            <Activity size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doğru Sayısı</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--color-black)' }}>{stats?.correctAnswers || 0}</p>
          </div>
        </div>
      </div>

      {/* Weekly Trends Line Chart */}
      <WeeklyTrends activityLog={activityLog} />

      {/* Github-style Contribution Graph */}
      <div className="card">
        <ContributionGraph activityLog={activityLog} />
      </div>

      {/* Topic Analysis */}
      <TopicAnalysis activityLog={activityLog} />
    </div>
  );
};

export default MyStats;
