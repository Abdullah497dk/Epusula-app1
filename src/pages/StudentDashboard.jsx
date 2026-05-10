import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dailyQuestions, units } from '../data/mockData';
import { allQuestions } from '../data/questionsData';
import { CheckCircle2, Circle, XCircle, Award, PlayCircle, ChevronLeft, ChevronRight, X, Send, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, updateProfile, addActivity } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    if (user?.stats?.lastTestDate === todayDate) {
      setAlreadyCompletedToday(true);
      if (user.stats.todaysAnswers) {
        setAnswers(user.stats.todaysAnswers);
        setScore(user.stats.todaysCorrectCount || 0);
        setSubmitted(true);
      }
    }
    
    // Get all questions for this user's class
    const allClassQs = [...dailyQuestions, ...allQuestions].filter(q => q.classId === user.classId);
    
    // Determine the "Day Index" globally based on a fixed start date
    // Let's use '2026-05-01' as the start date
    const startDate = new Date('2026-05-01T00:00:00Z');
    const now = new Date();
    // Start of current day
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysPassed = Math.floor((startOfToday - startDate) / (1000 * 60 * 60 * 24));
    
    // Ensure we don't get negative days
    const safeDaysPassed = Math.max(0, daysPassed);
    
    // 3 questions per day
    const startIndex = (safeDaysPassed * 3) % Math.max(1, allClassQs.length);
    
    let todaysQs = allClassQs.slice(startIndex, startIndex + 3);
    
    // If wrapping around at the end
    if (todaysQs.length < 3 && allClassQs.length >= 3) {
      todaysQs = [...todaysQs, ...allClassQs.slice(0, 3 - todaysQs.length)];
    }

    setQuestions(todaysQs);
  }, [user]);

  const handleOptionSelect = (qId, option) => {
    if (!submitted) {
      setAnswers(prev => ({ ...prev, [qId]: option }));
    }
  };

  const calculateScore = () => {
    let currentScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);

    if (!alreadyCompletedToday) {
      const todayDate = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      let points = 10; // Tamamlama puanı
      points += currentScore * 5; // Doğru cevap başı 5 puan

      const lastDateStr = user.stats?.lastTestDate;
      let currentStreak = user.stats?.streak || 0;
      
      if (lastDateStr) {
        const lastDate = new Date(lastDateStr);
        lastDate.setHours(0, 0, 0, 0);
        const today = new Date(todayDate);
        today.setHours(0, 0, 0, 0);
        
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Eğer 1 günden fazla ara verilmişse seriyi sıfırla
        if (diffDays > 1) {
          currentStreak = 0;
        }
      }

      let newStreak = currentStreak + 1;

      if (newStreak > 0 && newStreak % 10 === 0) {
        points += 100; // 10 günlük seride 100 bonus puan
      }

      setEarnedPoints(points);
      setAlreadyCompletedToday(true);

      const newTotalScore = (user.stats?.score || 0) + points;
      const newTotalAnswered = (user.stats?.totalAnswered || 0) + questions.length;
      const newCorrectAnswers = (user.stats?.correctAnswers || 0) + currentScore;

      const newActivity = {
        type: 'test_completed',
        count: currentScore,
        total: questions.length,
        date: now,
        details: questions.map(q => ({
          id: q.id,
          unitId: q.unitId,
          isCorrect: answers[q.id] === q.correctAnswer
        }))
      };
      const newActivityLog = [newActivity, ...(user.activityLog || [])].slice(0, 50);

      updateProfile({
        stats: {
          ...user.stats,
          score: newTotalScore,
          streak: newStreak,
          totalAnswered: newTotalAnswered,
          correctAnswers: newCorrectAnswers,
          lastTestDate: todayDate,
          todaysAnswers: answers,
          todaysCorrectCount: currentScore
        },
        activityLog: newActivityLog
      });
    }
  };

  const getUnitName = (unitId) => {
    return units.find(u => u.id === unitId)?.name || 'Bilinmeyen Ünite';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Intro Stats Banner */}
      <div className="card glass" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(to right, var(--color-purple), var(--color-purple-dark))',
        color: 'var(--color-white)',
        border: 'none',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>İyi çalışmalar, {user?.name.split(' ')[0]}!</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Serin: <span style={{ fontWeight: 700 }}>{user?.stats?.streak} Gün</span> 🔥</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Rank Card - Clickable */}
          <Link 
            to="/leaderboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(255,255,255,0.15)', 
              padding: '0.5rem 1rem', 
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
          >
            <Trophy size={20} color="#fcd34d" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Sıralama</span>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.stats?.rank || '-'}.</span>
            </div>
          </Link>

          {/* Score Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <Award size={20} color="#fcd34d" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Puan</span>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.stats?.score || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Quizz Area */}
      <div>
        {!isStarted ? (
          <div className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '4rem 2rem',
            textAlign: 'center',
            gap: '1.5rem',
            border: '2px dashed var(--color-gray)',
            backgroundColor: 'var(--color-white-off)'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <PlayCircle size={40} color="var(--color-blue)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-black)' }}>
                {alreadyCompletedToday ? "Bugünkü Görevini Tamamladın!" : "Günün Soruları Hazır!"}
              </h3>
              <p style={{ color: 'var(--color-black-light)', maxWidth: '400px', margin: '0 auto', fontSize: '1rem' }}>
                {alreadyCompletedToday ? "Cevaplarını ve doğru çözümleri inceleyebilirsin." : "Bugün senin için hazırlanan 3 soruyu çözmeye hazır mısın? Başarılar dileriz!"}
              </p>
            </div>
            <button 
              className="btn btn-accent" 
              onClick={() => {
                setIsStarted(true);
                setCurrentQuestionIndex(0);
                if (!alreadyCompletedToday) {
                  setAnswers({});
                  setSubmitted(false);
                }
              }} 
              style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '1.1rem', 
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
              }}
            >
              {alreadyCompletedToday ? "Çözümleri İncele" : "Günün Görevine Başla"}
            </button>
          </div>
        ) : (
          /* Immersive Exam Mode */
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-white-off)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Exam Header */}
            <header style={{
              height: '70px',
              backgroundColor: 'var(--color-white)',
              borderBottom: '1px solid var(--color-gray)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              position: 'sticky',
              top: 0,
              zIndex: 1001
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-black)' }}>Günün Görevi</h3>
                <span className="badge" style={{ backgroundColor: 'var(--color-gray)', color: 'var(--color-black-light)' }}>
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <button 
                onClick={() => setIsStarted(false)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#ef4444', 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }}
              >
                <X size={18} />
                Sınavı Bitir
              </button>
            </header>

            {/* Exam Body */}
            <main style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{ width: '100%', maxWidth: '800px', paddingBottom: '100px' }}>
                {questions.length > 0 && (
                  <div className="card" style={{ boxShadow: 'var(--shadow-lg)', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-gray)' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--color-blue)', color: 'var(--color-white)' }}>
                        Soru {currentQuestionIndex + 1}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-black-light)', fontWeight: 500 }}>
                        {getUnitName(questions[currentQuestionIndex].unitId)} | {questions[currentQuestionIndex].difficulty}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '2rem', lineHeight: 1.6, color: 'var(--color-black)' }}>
                      {questions[currentQuestionIndex].text}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {questions[currentQuestionIndex].options.map((opt, i) => {
                        const qId = questions[currentQuestionIndex].id;
                        const isSelected = answers[qId] === opt;
                        const isCorrectAnswer = submitted && questions[currentQuestionIndex].correctAnswer === opt;
                        const isWrongSelected = submitted && isSelected && questions[currentQuestionIndex].correctAnswer !== opt;
                        
                        let borderColor = 'var(--color-gray)';
                        let backgroundColor = 'transparent';
                        
                        if (isSelected && !submitted) {
                          borderColor = 'var(--color-purple)';
                          backgroundColor = 'rgba(112, 38, 185, 0.05)';
                        } else if (submitted) {
                          if (isCorrectAnswer) {
                            borderColor = '#22c55e';
                            backgroundColor = 'rgba(34, 197, 94, 0.1)';
                          } else if (isWrongSelected) {
                            borderColor = '#ef4444';
                            backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={submitted}
                            onClick={() => handleOptionSelect(qId, opt)}
                            style={{
                              padding: '1.25rem',
                              border: `2px solid ${borderColor}`,
                              backgroundColor,
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              textAlign: 'left',
                              cursor: submitted ? 'default' : 'pointer',
                              transition: 'all 0.2s',
                              width: '100%'
                            }}
                          >
                            {submitted ? (
                              isCorrectAnswer ? <CheckCircle2 size={24} color="#22c55e" /> : 
                              isWrongSelected ? <XCircle size={24} color="#ef4444" /> : 
                              <Circle size={24} color="var(--color-gray)" />
                            ) : (
                              <Circle size={24} color={isSelected ? 'var(--color-purple)' : 'var(--color-gray)'} />
                            )}
                            
                            <span style={{ 
                              fontSize: '1.05rem',
                              fontWeight: isSelected ? 600 : 400,
                              color: 'var(--color-black)' 
                            }}>
                              {String.fromCharCode(65 + i)}) {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {submitted && answers[questions[currentQuestionIndex].id] !== questions[currentQuestionIndex].correctAnswer && (
                      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--color-blue)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-black-light)', margin: 0 }}>
                          <strong>Doğru Cevap:</strong> {questions[currentQuestionIndex].correctAnswer}.
                        </p>
                      </div>
                    )}

                    {submitted && (
                      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                         <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-purple)' }}>
                            {alreadyCompletedToday && earnedPoints === 0 ? "Bugün görevini zaten tamamladın! " : "Tebrikler! "}
                            Doğru Sayın: {score} / {questions.length}
                            {earnedPoints > 0 && <span style={{display: 'block', color: 'var(--color-blue)', marginTop: '0.5rem'}}>+ {earnedPoints} Puan Kazandın!</span>}
                         </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>

            {/* Exam Footer Navigation */}
            <footer style={{
              height: '80px',
              backgroundColor: 'var(--color-white)',
              borderTop: '1px solid var(--color-gray)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 2rem',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1001
            }}>
              <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '800px', justifyContent: 'space-between' }}>
                <button 
                  className="btn btn-outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  style={{ opacity: currentQuestionIndex === 0 ? 0.3 : 1, flex: 1 }}
                >
                  <ChevronLeft size={20} />
                  Geri
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    style={{ flex: 1 }}
                  >
                    Sonraki
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    className="btn btn-accent"
                    onClick={calculateScore}
                    disabled={submitted || Object.keys(answers).length !== questions.length}
                    style={{ flex: 1, opacity: (submitted || Object.keys(answers).length !== questions.length) ? 0.5 : 1 }}
                  >
                    <Send size={18} />
                    Sınavı Tamamla
                  </button>
                )}
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
