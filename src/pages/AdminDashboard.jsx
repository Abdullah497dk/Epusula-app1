import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { classes, units } from '../data/mockData';
import { 
  PlusCircle, Search, Settings, BookOpen, Trash2, Edit2, 
  ChevronLeft, ChevronRight, X, Loader, AlertCircle, Save, HelpCircle, Upload, AlertTriangle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // CRUD Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null if adding new
  const [formData, setFormData] = useState({
    text: '',
    classId: 'class-6',
    unitId: 'unit-6-1',
    difficulty: 'Orta',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A'
  });

  // CSV Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvQuestions, setCsvQuestions] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const csvInputRef = useRef(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalQuestions: 0,
    classCounts: {}
  });

  // Fetch Stats (for info panels)
  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('class_id');
      
      if (error) throw error;

      const counts = {};
      data.forEach(q => {
        counts[q.class_id] = (counts[q.class_id] || 0) + 1;
      });

      setStats({
        totalQuestions: data.length,
        classCounts: counts
      });
    } catch (err) {
      console.error('Stats loading failed:', err);
    }
  };

  // Fetch Questions with filters and pagination
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' });

      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      }
      if (selectedUnit) {
        query = query.eq('unit_id', selectedUnit);
      }
      if (search) {
        query = query.ilike('text', `%${search}%`);
      }

      // Calculate pagination range
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: fetchErr, count } = await query
        .order('id', { ascending: false })
        .range(from, to);

      if (fetchErr) throw fetchErr;

      setQuestions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err.message || 'Sorular yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedClass, selectedUnit, currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Trigger search on button click
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions();
  };

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      classId: selectedClass || 'class-6',
      unitId: selectedUnit || (selectedClass ? (units.find(u => u.classId === selectedClass)?.id || '') : 'unit-6-1'),
      difficulty: 'Orta',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A'
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      text: q.text,
      classId: q.class_id,
      unitId: q.unit_id,
      difficulty: q.difficulty || 'Orta',
      optionA: q.options[0] || '',
      optionB: q.options[1] || '',
      optionC: q.options[2] || '',
      optionD: q.options[3] || '',
      correctOption: q.options[0] === q.correct_answer ? 'A' :
                     q.options[1] === q.correct_answer ? 'B' :
                     q.options[2] === q.correct_answer ? 'C' : 'D'
    });
    setIsModalOpen(true);
  };

  // Form handle changes
  const handleFormChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      // If class changes, auto-select the first unit of the new class
      if (key === 'classId') {
        const availableUnits = units.filter(u => u.classId === value);
        updated.unitId = availableUnits.length > 0 ? availableUnits[0].id : '';
      }
      return updated;
    });
  };

  // Delete question handler
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error: delErr } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;

      alert('Soru başarıyla silindi.');
      fetchQuestions();
      fetchStats();
    } catch (err) {
      alert('Soru silinirken hata: ' + err.message);
    }
  };

  // Save/Create Question handler
  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    const optionsArray = [
      formData.optionA.trim(),
      formData.optionB.trim(),
      formData.optionC.trim(),
      formData.optionD.trim()
    ];

    if (optionsArray.some(opt => !opt)) {
      alert('Lütfen tüm seçenekleri doldurun.');
      return;
    }

    let correctAnswerText = '';
    switch (formData.correctOption) {
      case 'A': correctAnswerText = optionsArray[0]; break;
      case 'B': correctAnswerText = optionsArray[1]; break;
      case 'C': correctAnswerText = optionsArray[2]; break;
      case 'D': correctAnswerText = optionsArray[3]; break;
      default: correctAnswerText = optionsArray[0];
    }

    const payload = {
      class_id: formData.classId,
      unit_id: formData.unitId,
      text: formData.text,
      options: optionsArray,
      correct_answer: correctAnswerText,
      difficulty: formData.difficulty
    };

    try {
      if (editingQuestion) {
        // Update
        const { error: updateErr } = await supabase
          .from('questions')
          .update(payload)
          .eq('id', editingQuestion.id);

        if (updateErr) throw updateErr;
        alert('Soru başarıyla güncellendi.');
      } else {
        // Create
        const randomId = `q-${formData.classId}-${Math.random().toString(36).substring(2, 9)}`;
        const { error: insertErr } = await supabase
          .from('questions')
          .insert({
            id: randomId,
            ...payload
          });

        if (insertErr) throw insertErr;
        alert('Yeni soru başarıyla eklendi.');
      }

      setIsModalOpen(false);
      fetchQuestions();
      fetchStats();
    } catch (err) {
      alert('Soru kaydedilirken hata oluştu: ' + err.message);
    }
  };

  // CSV Import Parser & Handler
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) {
        setCsvErrors(['Dosya boş.']);
        return;
      }

      // Delimiter detection (semicolon for Turkish Excel standard, comma for general)
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') ? ';' : ',';

      const questionsParsed = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom parser to support values containing commas/semicolons inside double quotes
        const row = [];
        let insideQuotes = false;
        let entry = '';

        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const char = line[charIdx];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === delimiter && !insideQuotes) {
            row.push(entry.trim());
            entry = '';
          } else {
            entry += char;
          }
        }
        row.push(entry.trim());

        // Validate column count (expecting at least 8: class_id, unit_id, text, A, B, C, D, correct_answer)
        if (row.length < 8) {
          errors.push(`Satır ${i + 1}: Eksik alan. Soru formatı en az 8 sütun içermelidir.`);
          continue;
        }

        // Clean cells from surrounding quotes
        const cleanedRow = row.map(cell => {
          let val = cell;
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          }
          // Unescape inside double quotes
          val = val.replace(/""/g, '"');
          return val;
        });

        const [classId, unitId, qText, optA, optB, optC, optD, correctAns, difficulty] = cleanedRow;

        if (!classId || !unitId || !qText || !optA || !optB || !optC || !optD || !correctAns) {
          errors.push(`Satır ${i + 1}: Sınıf ID, Ünite ID, Soru Metni, Şıklar ve Doğru Cevap zorunludur.`);
          continue;
        }

        // Validate if class_id is known
        const isClassValid = classes.some(c => c.id === classId.trim());
        if (!isClassValid) {
          errors.push(`Satır ${i + 1}: Tanımlanmayan Sınıf ID '${classId}'. Örneğin 'class-6' olmalıdır.`);
          continue;
        }

        // Validate if correct answer is one of the options
        const options = [optA, optB, optC, optD];
        const isCorrectInOptions = options.some(opt => opt.trim() === correctAns.trim());
        if (!isCorrectInOptions) {
          errors.push(`Satır ${i + 1}: Doğru cevap metni ('${correctAns}'), seçeneklerden biriyle (A, B, C, D) tam olarak eşleşmelidir.`);
          continue;
        }

        questionsParsed.push({
          class_id: classId.trim(),
          unit_id: unitId.trim(),
          text: qText.trim(),
          options: options.map(o => o.trim()),
          correct_answer: correctAns.trim(),
          difficulty: ['Kolay', 'Orta', 'Zor'].includes(difficulty) ? difficulty : 'Orta'
        });
      }

      setCsvQuestions(questionsParsed);
      setCsvErrors(errors);
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleUploadCsv = async () => {
    if (csvQuestions.length === 0) return;
    setUploadingCsv(true);
    setUploadProgress(0);
    let successCount = 0;
    const chunkSize = 50;

    try {
      for (let i = 0; i < csvQuestions.length; i += chunkSize) {
        const chunk = csvQuestions.slice(i, i + chunkSize);
        
        // Add random IDs to entries
        const chunkWithIds = chunk.map(q => ({
          id: `q-${q.class_id}-${Math.random().toString(36).substring(2, 9)}`,
          ...q
        }));

        const { error: insertErr } = await supabase
          .from('questions')
          .insert(chunkWithIds);

        if (insertErr) throw insertErr;

        successCount += chunk.length;
        setUploadProgress(Math.round((successCount / csvQuestions.length) * 100));
      }

      alert(`Başarıyla ${successCount} soru sisteme yüklendi!`);
      setIsCsvModalOpen(false);
      setCsvQuestions([]);
      setCsvErrors([]);
      if (csvInputRef.current) csvInputRef.current.value = '';
      fetchQuestions();
      fetchStats();
    } catch (err) {
      alert(`Soru aktarımı sırasında hata oluştu: ${err.message}`);
    } finally {
      setUploadingCsv(false);
    }
  };

  // Get Unit Name helper
  const getUnitNameLocal = (unitId) => {
    return units.find(u => u.id === unitId)?.name || 'Bilinmeyen Ünite';
  };

  // Get Class Name helper
  const getClassNameLocal = (classId) => {
    return classes.find(c => c.id === classId)?.name || 'Genel';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-black)', fontWeight: 800, marginBottom: '0.25rem' }}>
            İçerik ve Soru Yönetimi
          </h2>
          <p style={{ color: 'var(--color-black-light)' }}>
            E-Pusula platformundaki soru havuzunu yönetin, güncelleyin ve yeni sorular ekleyin.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsCsvModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <Upload size={18} />
            CSV ile Toplu Yükle
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleOpenAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <PlusCircle size={20} />
            Yeni Soru Ekle
          </button>
        </div>
      </div>

      {/* Info Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card glass" style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dark))', color: 'white', border: 'none' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.85, fontWeight: 600 }}>Toplam Soru Havuzu</span>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 800 }}>{stats.totalQuestions} Soru</h3>
        </div>
        {classes.slice(0, 4).map(c => (
          <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-black-light)', fontWeight: 600 }}>{c.name}</span>
            <h4 style={{ fontSize: '1.5rem', margin: '0.25rem 0 0 0', color: 'var(--color-black)', fontWeight: 700 }}>
              {stats.classCounts[c.id] || 0} Soru
            </h4>
          </div>
        ))}
      </div>

      {/* Filter and Table Container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        
        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Text Search */}
          <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-gray)' }}>
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Soru metninde ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-gray)',
                outline: 'none',
                backgroundColor: 'var(--color-white-off)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Class Select */}
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedUnit('');
              setCurrentPage(1);
            }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-gray)',
              outline: 'none',
              backgroundColor: 'var(--color-white-off)',
              fontSize: '0.95rem',
              flex: 1,
              minWidth: '150px'
            }}
          >
            <option value="">Tüm Sınıflar</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Unit Select */}
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setCurrentPage(1);
            }}
            disabled={!selectedClass}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-gray)',
              outline: 'none',
              backgroundColor: 'var(--color-white-off)',
              fontSize: '0.95rem',
              flex: 1,
              minWidth: '200px',
              opacity: selectedClass ? 1 : 0.5
            }}
          >
            <option value="">Tüm Üniteler</option>
            {units
              .filter(u => u.classId === selectedClass)
              .map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))
            }
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Filtrele
          </button>
        </form>

        {/* Table / List Container */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--color-black-light)' }}>
            <Loader className="spinner" size={40} style={{ color: 'var(--color-purple)' }} />
            <span>Sorular yükleniyor...</span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={24} />
            <div>
              <h4 style={{ margin: 0, fontWeight: 700 }}>Hata Oluştu</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{error}</p>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', border: '1px dashed var(--color-gray)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-black-light)' }}>
            <HelpCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h4 style={{ margin: 0, color: 'var(--color-black)' }}>Soru Bulunamadı</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Seçilen filtrelere uygun soru bulunamadı. Yeni soru ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-gray)', color: 'var(--color-black-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Sınıf / Ünite</th>
                  <th style={{ padding: '1rem 0.5rem', width: '50%' }}>Soru Metni</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Zorluk</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Doğru Cevap</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--color-gray)', transition: 'background-color 0.2s', fontSize: '0.95rem' }} className="table-row-hover">
                    <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--color-purple)', color: 'white', marginBottom: '0.25rem', display: 'inline-block' }}>
                        {getClassNameLocal(q.class_id)}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-black-light)', maxWidth: '180px' }}>
                        {getUnitNameLocal(q.unit_id)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', fontWeight: 500, color: 'var(--color-black)', lineHeight: 1.5 }}>
                      {q.text.length > 150 ? `${q.text.substring(0, 150)}...` : q.text}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: q.difficulty === 'Zor' ? 'rgba(239, 68, 68, 0.1)' : 
                                         q.difficulty === 'Kolay' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: q.difficulty === 'Zor' ? '#ef4444' : 
                               q.difficulty === 'Kolay' ? '#22c55e' : '#f59e0b'
                      }}>
                        {q.difficulty || 'Orta'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', color: '#22c55e', fontWeight: 600 }}>
                      {q.correct_answer}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenEditModal(q)}
                          style={{
                            padding: '0.4rem',
                            border: '1px solid var(--color-gray)',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            color: 'var(--color-blue)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          style={{
                            padding: '0.4rem',
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fef2f2',
                            borderRadius: '4px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--color-gray)', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-black-light)' }}>
              Toplam <strong>{totalCount}</strong> sorudan <strong>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)}</strong> arası gösteriliyor.
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} />
                Geri
              </button>
              <span style={{ padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-black)' }}>
                {currentPage} / {totalPages}
              </span>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                İleri
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div className="card glass" style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'var(--color-white)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-black)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="var(--color-purple)" />
                CSV ile Toplu Soru Yükleme
              </h3>
              <button 
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setCsvQuestions([]);
                  setCsvErrors([]);
                  if (csvInputRef.current) csvInputRef.current.value = '';
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-black-light)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Guide Info */}
            <div style={{ fontSize: '0.85rem', color: 'var(--color-black-light)', backgroundColor: 'var(--color-white-off)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-purple)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>CSV Dosya Formatı Kuralları:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Dosya sütunları sırasıyla şu şekilde olmalıdır: <strong>class_id, unit_id, text, optionA, optionB, optionC, optionD, correct_answer, difficulty</strong></li>
                <li><strong>class_id</strong> değerleri: <code>class-6</code>, <code>class-7</code> ... <code>class-12</code> olmalıdır.</li>
                <li><strong>correct_answer</strong> değeri girilen seçeneklerden (A, B, C veya D) birinin metni ile tam olarak eşleşmelidir.</li>
                <li><strong>difficulty</strong> değeri: <code>Kolay</code>, <code>Orta</code> veya <code>Zor</code> olabilir (boş bırakılırsa Orta atanır).</li>
              </ul>
            </div>

            {/* File Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>CSV Dosyası Seçin (.csv)</label>
              <input 
                type="file" 
                accept=".csv"
                ref={csvInputRef}
                onChange={handleCsvFileChange}
                disabled={uploadingCsv}
                style={{
                  padding: '0.75rem',
                  border: '2px dashed var(--color-gray)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  width: '100%'
                }}
              />
            </div>

            {/* Errors display */}
            {csvErrors.length > 0 && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)', padding: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                <h4 style={{ color: '#ef4444', fontSize: '0.9rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertTriangle size={16} />
                  Ayrıştırma Hataları ({csvErrors.length} hata var. Lütfen dosyayı düzeltin):
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--color-black-light)' }}>
                  {csvErrors.map((err, i) => <li key={i} style={{ color: '#dc2626' }}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Preview of parsed data */}
            {csvQuestions.length > 0 && (
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-gray)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ backgroundColor: 'var(--color-white-off)', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--color-gray)' }}>
                  Yüklenecek Sorular Önizlemesi ({csvQuestions.length} Soru Bulundu)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-white-off)', borderBottom: '1px solid var(--color-gray)' }}>
                      <th style={{ padding: '0.5rem 1rem' }}>Sınıf</th>
                      <th style={{ padding: '0.5rem 1rem', width: '50%' }}>Soru Metni</th>
                      <th style={{ padding: '0.5rem 1rem' }}>Doğru Cevap</th>
                      <th style={{ padding: '0.5rem 1rem' }}>Zorluk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvQuestions.slice(0, 5).map((q, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-gray)' }}>
                        <td style={{ padding: '0.5rem 1rem' }}>{getClassNameLocal(q.class_id)}</td>
                        <td style={{ padding: '0.5rem 1rem' }}>{q.text.length > 80 ? `${q.text.substring(0, 80)}...` : q.text}</td>
                        <td style={{ padding: '0.5rem 1rem', color: '#22c55e', fontWeight: 600 }}>{q.correct_answer}</td>
                        <td style={{ padding: '0.5rem 1rem' }}>{q.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvQuestions.length > 5 && (
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--color-black-light)', textAlign: 'center', backgroundColor: 'var(--color-white-off)' }}>
                    ... ve {csvQuestions.length - 5} soru daha yüklenecek.
                  </div>
                )}
              </div>
            )}

            {/* Uploading progress bar */}
            {uploadingCsv && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>Sorular Yükleniyor...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-gray)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--color-purple)', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-gray)', paddingTop: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                disabled={uploadingCsv}
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setCsvQuestions([]);
                  setCsvErrors([]);
                  if (csvInputRef.current) csvInputRef.current.value = '';
                }}
                style={{ flex: 1 }}
              >
                Kapat
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleUploadCsv}
                disabled={csvQuestions.length === 0 || csvErrors.length > 0 || uploadingCsv}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (csvQuestions.length === 0 || csvErrors.length > 0 || uploadingCsv) ? 0.5 : 1 }}
              >
                {uploadingCsv ? <Loader className="spinner" size={18} /> : <Save size={18} />}
                Aktarımı Başlat ({csvQuestions.length} Soru)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div className="card glass" style={{
            width: '100%',
            maxWidth: '700px',
            backgroundColor: 'var(--color-white)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-black)', fontWeight: 700, margin: 0 }}>
                {editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-black-light)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Question Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-black)' }}>Soru Metni</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.text}
                  onChange={(e) => handleFormChange('text', e.target.value)}
                  placeholder="Soru metnini yazınız..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Class & Unit Select Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-black)' }}>Sınıfı</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleFormChange('classId', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-gray)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-black)' }}>Ünite / Konu</label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => handleFormChange('unitId', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-gray)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    {units
                      .filter(u => u.classId === formData.classId)
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-black)' }}>Zorluk Derecesi</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleFormChange('difficulty', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-gray)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="Kolay">Kolay</option>
                    <option value="Orta">Orta</option>
                    <option value="Zor">Zor</option>
                  </select>
                </div>

              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--color-gray)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-black)', marginBottom: '0.25rem' }}>Seçenekler</label>
                
                {/* Option A */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, minWidth: '20px' }}>A)</span>
                  <input 
                    type="text" 
                    required
                    value={formData.optionA}
                    onChange={(e) => handleFormChange('optionA', e.target.value)}
                    placeholder="A seçeneği cevabı"
                    style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)', outline: 'none' }}
                  />
                </div>

                {/* Option B */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, minWidth: '20px' }}>B)</span>
                  <input 
                    type="text" 
                    required
                    value={formData.optionB}
                    onChange={(e) => handleFormChange('optionB', e.target.value)}
                    placeholder="B seçeneği cevabı"
                    style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)', outline: 'none' }}
                  />
                </div>

                {/* Option C */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, minWidth: '20px' }}>C)</span>
                  <input 
                    type="text" 
                    required
                    value={formData.optionC}
                    onChange={(e) => handleFormChange('optionC', e.target.value)}
                    placeholder="C seçeneği cevabı"
                    style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)', outline: 'none' }}
                  />
                </div>

                {/* Option D */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, minWidth: '20px' }}>D)</span>
                  <input 
                    type="text" 
                    required
                    value={formData.optionD}
                    onChange={(e) => handleFormChange('optionD', e.target.value)}
                    placeholder="D seçeneği cevabı"
                    style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Correct Answer Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--color-gray)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-black)' }}>Doğru Cevap Seçeneği</label>
                <select
                  value={formData.correctOption}
                  onChange={(e) => handleFormChange('correctOption', e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: '#22c55e',
                    color: '#15803d'
                  }}
                >
                  <option value="A">A Seçeneği</option>
                  <option value="B">B Seçeneği</option>
                  <option value="C">C Seçeneği</option>
                  <option value="D">D Seçeneği</option>
                </select>
              </div>

              {/* Save / Cancel buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-gray)', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  Soruyu Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
