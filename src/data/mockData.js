export const users = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    role: "student",
    classId: "class-12",
    email: "ahmet@epusula.net",
    password: "123", // In a real app never store passwords in plaintext
    stats: {
      streak: 15,
      totalAnswered: 45,
      correctAnswers: 38,
      rank: 1,
    }
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
  { id: "class-9", name: "9. Sınıf" },
  { id: "class-10", name: "10. Sınıf" },
  { id: "class-11", name: "11. Sınıf" },
  { id: "class-12", name: "12. Sınıf" }
];

export const units = [
  { id: "unit-12-1", classId: "class-12", name: "Limit ve Süreklilik" },
  { id: "unit-12-2", classId: "class-12", name: "Türev" },
  { id: "unit-12-3", classId: "class-12", name: "İntegral" }
];

export const dailyQuestions = [
  {
    id: "q_1",
    date: new Date().toISOString().split('T')[0],
    classId: "class-12",
    unitId: "unit-12-1",
    text: "f(x) = (x^2 - 4) / (x - 2) fonksiyonunun x=2 noktasındaki limiti kaçtır?",
    options: ["2", "4", "0", "Belirsiz"],
    correctAnswer: "4",
    difficulty: "Orta"
  },
  {
    id: "q_2",
    date: new Date().toISOString().split('T')[0],
    classId: "class-12",
    unitId: "unit-12-1",
    text: "lim(x→∞) (3x^2 + 2x) / (x^2 - 1) ifadesinin değeri nedir?",
    options: ["3", "1", "∞", "0"],
    correctAnswer: "3",
    difficulty: "Kolay"
  },
  {
    id: "q_3",
    date: new Date().toISOString().split('T')[0],
    classId: "class-12",
    unitId: "unit-12-2",
    text: "f(x) = x^3 - 3x^2 + 5 fonksiyonunun yerel minimum noktası apsisi kaçtır?",
    options: ["0", "1", "2", "3"],
    correctAnswer: "2",
    difficulty: "Zor"
  }
];

export const classStats = {
  "class-12": {
    totalStudents: 24,
    activeToday: 18,
    averageSuccessRate: 72,
    weakestUnit: "Türev",
    recentActivity: [
      { userId: "1", name: "Ahmet Yılmaz", action: "Günün 3 sorusunu tamamladı (3/3 doğru)" },
      { userId: "4", name: "Merve Kaya", action: "Günün 3 sorusunu tamamladı (2/3 doğru)" },
      { userId: "5", name: "Can Taş", action: "Giriş yaptı" }
    ]
  }
};
