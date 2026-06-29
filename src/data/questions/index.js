// Tüm sınıfların soru bankalarını tek noktada birleştirir.
// Yeni sınıf eklemek için: ilgili classN.js dosyasını oluştur, burada import edip
// QUESTIONS_BY_CLASS haritasına ekle.
import { class6Questions } from './class6.js';
import { class7Questions } from './class7.js';
import { class8Questions } from './class8.js';
import { class9Questions } from './class9.js';
import { class10Questions } from './class10.js';
import { class11Questions } from './class11.js';
import { class12Questions } from './class12.js';

export const QUESTIONS_BY_CLASS = {
  'class-6': class6Questions,
  'class-7': class7Questions,
  'class-8': class8Questions,
  'class-9': class9Questions,
  'class-10': class10Questions,
  'class-11': class11Questions,
  'class-12': class12Questions
};

// Tek düz dizi (geriye dönük uyumluluk için).
export const allQuestions = Object.values(QUESTIONS_BY_CLASS).flat();
