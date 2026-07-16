import { supabase } from '../supabaseClient';
import { classes, units } from './mockData';

// Günlük rotasyonun başlangıç tarihi (sabit referans noktası).
const ROTATION_START = new Date('2026-05-01T00:00:00');
const QUESTIONS_PER_DAY = 3;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Verilen tarih için kaç gün geçtiğini hesaplar (negatif olmaz).
const daysSinceStart = (date) => {
  const diff = startOfDay(date) - startOfDay(ROTATION_START);
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Bir sınıf için belirli bir günün sorularını döndürür (varsayılan: bugün).
 * Supabase questions tablosundan class_id değerine göre çeker.
 */
export const getDailyQuestions = async (classId, date = new Date()) => {
  if (!classId) return [];
  
  const { data: pool, error } = await supabase
    .from('questions')
    .select('*')
    .eq('class_id', classId);

  if (error || !pool || pool.length === 0) {
    console.error('Soru havuzu yüklenemedi:', error);
    return [];
  }

  const daysPassed = daysSinceStart(date);
  const startIndex = (daysPassed * QUESTIONS_PER_DAY) % pool.length;
  const count = Math.min(QUESTIONS_PER_DAY, pool.length);

  const result = [];
  for (let i = 0; i < count; i++) {
    const rawQ = pool[(startIndex + i) % pool.length];
    result.push({
      id: rawQ.id,
      classId: rawQ.class_id,
      unitId: rawQ.unit_id,
      text: rawQ.text,
      options: rawQ.options,
      correctAnswer: rawQ.correct_answer,
      difficulty: rawQ.difficulty
    });
  }
  return result;
};

export const getClasses = () => classes;

export const getUnits = (classId) =>
  classId ? units.filter((u) => u.classId === classId) : units;

export const getUnitName = (unitId) =>
  units.find((u) => u.id === unitId)?.name || 'Bilinmeyen Ünite';

export const getClassName = (classId) =>
  classes.find((c) => c.id === classId)?.name || '';

/**
 * Bir öğrencinin puanına göre genel sıralamasını (1 tabanlı) hesaplar.
 * allUsers içinde yalnızca öğrenciler dikkate alınır.
 */
export const computeRank = (allUsers, userId) => {
  const students = (allUsers || [])
    .filter((u) => u.role === 'student')
    .sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));
  const idx = students.findIndex((u) => u.id === userId);
  return idx === -1 ? null : idx + 1;
};
