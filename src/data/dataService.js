// Veri erişim katmanı (Data Access Layer).
// UI bileşenleri veriyi doğrudan mockData/questions'tan değil, buradan okur.
// Supabase aşamasında bu dosyanın içi Supabase çağrılarına çevrilir; imzalar aynı kalır.
import { QUESTIONS_BY_CLASS } from './questions/index.js';
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
 * Havuz boşsa boş dizi döner. Aynı gün içinde tekrar etmez; havuz 3'ün katı
 * olduğunda günler arası da çakışma olmaz.
 */
export const getDailyQuestions = (classId, date = new Date()) => {
  const pool = QUESTIONS_BY_CLASS[classId] || [];
  if (pool.length === 0) return [];

  const daysPassed = daysSinceStart(date);
  const startIndex = (daysPassed * QUESTIONS_PER_DAY) % pool.length;
  const count = Math.min(QUESTIONS_PER_DAY, pool.length);

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(startIndex + i) % pool.length]);
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
