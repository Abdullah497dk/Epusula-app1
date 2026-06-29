// Demo kullanıcıları (yalnızca localStorage boşken ilk kurulum için kullanılır).
// Gerçek çok kullanıcılı veri Supabase aşamasında gelecek.
export const users = [
  {
    id: "1",
    name: "Ahmet Adil",
    role: "student",
    classId: "class-12",
    email: "ahmetadil@epusula.net",
    password: "123",
    studentNo: "100001",
    stats: {
      streak: 5,
      totalAnswered: 120,
      correctAnswers: 98,
      rank: 2,
      score: 450,
      lastTestDate: new Date().toISOString()
    },
    activityLog: [
      { type: 'test_completed', count: 3, total: 3, date: new Date(Date.now() - 0 * 86400000).toISOString() },
      { type: 'test_completed', count: 2, total: 3, date: new Date(Date.now() - 1 * 86400000).toISOString() },
      { type: 'test_completed', count: 3, total: 3, date: new Date(Date.now() - 4 * 86400000).toISOString() },
      { type: 'test_completed', count: 1, total: 3, date: new Date(Date.now() - 6 * 86400000).toISOString() },
      { type: 'login', date: new Date().toISOString() }
    ]
  },
  {
    id: "student-zeynep",
    name: "Zeynep Kaya",
    role: "student",
    classId: "class-12",
    email: "zeynep@epusula.net",
    password: "123",
    studentNo: "100002",
    stats: {
      streak: 15,
      totalAnswered: 45,
      correctAnswers: 38,
      rank: 1,
      score: 620
    },
    activityLog: []
  },
  {
    id: "2",
    name: "Ayşe Öz",
    role: "teacher",
    classId: "class-12",
    email: "ayse@epusula.net",
    password: "123"
  },
  {
    id: "3",
    name: "Admin",
    role: "admin",
    email: "admin@epusula.net",
    password: "123"
  }
];

export const classes = [
  { id: "class-6", name: "6. Sınıf" },
  { id: "class-7", name: "7. Sınıf" },
  { id: "class-8", name: "8. Sınıf" },
  { id: "class-9", name: "9. Sınıf" },
  { id: "class-10", name: "10. Sınıf" },
  { id: "class-11", name: "11. Sınıf" },
  { id: "class-12", name: "12. Sınıf" }
];

// Her sınıf için üniteler (MEB müfredatına uyumlu, sınıf başına 4 ünite).
// unitId değerleri src/data/questions/*.js soru bankasıyla birebir eşleşir.
export const units = [
  // 6. Sınıf
  { id: "unit-6-1", classId: "class-6", name: "Doğal Sayılarla İşlemler ve Çarpanlar" },
  { id: "unit-6-2", classId: "class-6", name: "Kesirlerle İşlemler" },
  { id: "unit-6-3", classId: "class-6", name: "Ondalık Gösterim ve Yüzdeler" },
  { id: "unit-6-4", classId: "class-6", name: "Açılar, Alan ve Geometri" },
  // 7. Sınıf
  { id: "unit-7-1", classId: "class-7", name: "Tam Sayılarla İşlemler" },
  { id: "unit-7-2", classId: "class-7", name: "Rasyonel Sayılar" },
  { id: "unit-7-3", classId: "class-7", name: "Oran-Orantı ve Yüzdeler" },
  { id: "unit-7-4", classId: "class-7", name: "Cebirsel İfadeler ve Eşitlik" },
  // 8. Sınıf
  { id: "unit-8-1", classId: "class-8", name: "Çarpanlar ve Katlar" },
  { id: "unit-8-2", classId: "class-8", name: "Üslü ve Kareköklü İfadeler" },
  { id: "unit-8-3", classId: "class-8", name: "Cebirsel İfadeler ve Özdeşlikler" },
  { id: "unit-8-4", classId: "class-8", name: "Doğrusal Denklemler ve Eşitsizlikler" },
  // 9. Sınıf
  { id: "unit-9-1", classId: "class-9", name: "Kümeler ve Sayı Kümeleri" },
  { id: "unit-9-2", classId: "class-9", name: "Denklem ve Eşitsizlikler" },
  { id: "unit-9-3", classId: "class-9", name: "Üçgenler" },
  { id: "unit-9-4", classId: "class-9", name: "Veri, Sayma ve Olasılık" },
  // 10. Sınıf
  { id: "unit-10-1", classId: "class-10", name: "Sayma ve Olasılık" },
  { id: "unit-10-2", classId: "class-10", name: "Fonksiyonlar" },
  { id: "unit-10-3", classId: "class-10", name: "Polinomlar" },
  { id: "unit-10-4", classId: "class-10", name: "Analitik Geometri" },
  // 11. Sınıf
  { id: "unit-11-1", classId: "class-11", name: "Trigonometri" },
  { id: "unit-11-2", classId: "class-11", name: "Analitik Geometri" },
  { id: "unit-11-3", classId: "class-11", name: "Fonksiyonlarda Uygulamalar" },
  { id: "unit-11-4", classId: "class-11", name: "Olasılık" },
  // 12. Sınıf
  { id: "unit-12-1", classId: "class-12", name: "Limit ve Süreklilik" },
  { id: "unit-12-2", classId: "class-12", name: "Türev" },
  { id: "unit-12-3", classId: "class-12", name: "İntegral" },
  { id: "unit-12-4", classId: "class-12", name: "Üstel ve Logaritmik Fonksiyonlar" }
];
