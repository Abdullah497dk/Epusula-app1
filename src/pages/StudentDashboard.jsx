import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dailyQuestions, units } from '../data/mockData';
import { CheckCircle2, Circle, XCircle, Award } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // A real app would fetch from API mapping user.classId -> today's questions
    // Here we're mocking fetching latest 3 questions for their class
    const todaysQs = dailyQuestions.filter(q => q.classId === user.classId).slice(0, 3);
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
        border: 'none'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>İyi çalışmalar, {user?.name.split(' ')[0]}!</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Serin: <span style={{ fontWeight: 700 }}>{user?.stats?.streak} Gün</span> 🔥</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <Award size={24} color="#fcd34d" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Sıralama</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>#{user?.stats?.rank}</span>
          </div>
        </div>
      </div>

      {/* Main Quizz Area */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-black)', borderBottom: '2px solid var(--color-blue)', paddingBottom: '0.25rem' }}>Günün Soruları</h3>
          {!submitted ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-black-light)' }}>
              {Object.keys(answers).length} / {questions.length} Çözüldü
            </span>
          ) : (
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: score === questions.length ? 'green' : 'var(--color-purple)' }}>
              Sonuç: {score} Doğru, {questions.length - score} Yanlış
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map((q, index) => (
            <div key={q.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-gray)' }}>
                <span className="badge" style={{ backgroundColor: 'var(--color-blue)', color: 'var(--color-white)' }}>
                  Soru {index + 1}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-black-light)', fontWeight: 500 }}>
                  {getUnitName(q.unitId)} | {q.difficulty}
                </span>
              </div>
              
              <p style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {q.text}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === opt;
                  const isCorrectAnswer = submitted && q.correctAnswer === opt;
                  const isWrongSelected = submitted && isSelected && q.correctAnswer !== opt;
                  
                  let borderColor = 'var(--color-gray)';
                  let backgroundColor = 'transparent';
                  
                  if (isSelected && !submitted) {
                    borderColor = 'var(--color-purple)';
                    backgroundColor = 'rgba(112, 38, 185, 0.05)';
                  } else if (submitted) {
                    if (isCorrectAnswer) {
                      borderColor = '#22c55e'; // green
                      backgroundColor = 'rgba(34, 197, 94, 0.1)';
                    } else if (isWrongSelected) {
                      borderColor = '#ef4444'; // red
                      backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={submitted}
                      onClick={() => handleOptionSelect(q.id, opt)}
                      style={{
                        padding: '1rem',
                        border: `2px solid ${borderColor}`,
                        backgroundColor,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        textAlign: 'left',
                        cursor: submitted ? 'default' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {submitted ? (
                        isCorrectAnswer ? <CheckCircle2 size={20} color="#22c55e" /> : 
                        isWrongSelected ? <XCircle size={20} color="#ef4444" /> : 
                        <Circle size={20} color="var(--color-gray)" />
                      ) : (
                        <Circle size={20} color={isSelected ? 'var(--color-purple)' : 'var(--color-gray)'} />
                      )}
                      
                      <span style={{ 
                        fontWeight: isSelected ? 600 : 400,
                        color: (submitted && (isCorrectAnswer || isWrongSelected)) ? 'inherit' : 'var(--color-black)' 
                      }}>
                        {String.fromCharCode(65 + i)}) {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {submitted && answers[q.id] !== q.correctAnswer && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--color-blue)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', margin: 0 }}>
                    <strong>Doğru Cevap:</strong> {q.correctAnswer}. Konu tekrarı yapmak ister misin?
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {!submitted && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={calculateScore}
              disabled={Object.keys(answers).length !== questions.length}
              style={{ opacity: Object.keys(answers).length !== questions.length ? 0.5 : 1 }}
            >
              Cevapları Gönder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
