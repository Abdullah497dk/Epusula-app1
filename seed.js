import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// .env dosyasını manuel okuyup çözümleyelim (ek kütüphane ihtiyacını önlemek için)
let env = {};
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value.trim();
    }
  });
} catch (err) {
  console.error('.env dosyası okunamadı:', err.message);
  process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("HATA: .env dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlanmış olmalıdır.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const classes = [6, 7, 8, 9, 10, 11, 12];
const allQuestions = [];

console.log("Soru dosyaları okunuyor...");

for (const c of classes) {
  const filePath = `./src/data/questions/class${c}.js`;
  const modulePath = path.resolve(filePath);
  
  try {
    const module = await import(`file://${modulePath}`);
    const questions = module[`class${c}Questions`];
    if (questions) {
      allQuestions.push(...questions);
    }
  } catch (err) {
    console.error(`Sınıf ${c} soruları yüklenirken hata oluştu:`, err.message);
  }
}

console.log(`Toplam ${allQuestions.length} soru bulundu. Veritabanına yükleniyor...`);

const mappedQuestions = allQuestions.map(q => ({
  id: q.id,
  class_id: q.classId,
  unit_id: q.unitId,
  text: q.text,
  options: q.options,
  correct_answer: q.correctAnswer,
  difficulty: q.difficulty || 'Orta'
}));

// Payload sınırlarına takılmamak için 50'şerli gruplar (chunk) halinde yükleyelim
const chunkSize = 50;
let successCount = 0;

for (let i = 0; i < mappedQuestions.length; i += chunkSize) {
  const chunk = mappedQuestions.slice(i, i + chunkSize);
  const { error } = await supabase.from('questions').upsert(chunk);
  if (error) {
    console.error(`Hata [indeks ${i}]:`, error.message);
  } else {
    successCount += chunk.length;
    console.log(`Başarıyla yüklendi: ${successCount} / ${mappedQuestions.length}`);
  }
}

console.log("Yükleme işlemi tamamlandı!");
process.exit(0);
