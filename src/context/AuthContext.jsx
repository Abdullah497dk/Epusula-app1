import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [customClasses, setCustomClasses] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    // Load users from local storage or initialize with mockData
    const storedUsers = localStorage.getItem('epusula_all_users');
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    } else {
      setAllUsers(initialUsers);
      localStorage.setItem('epusula_all_users', JSON.stringify(initialUsers));
    }

    const storedClasses = localStorage.getItem('epusula_custom_classes');
    if (storedClasses) {
      setCustomClasses(JSON.parse(storedClasses));
    }

    const storedRequests = localStorage.getItem('epusula_join_requests');
    if (storedRequests) {
      setJoinRequests(JSON.parse(storedRequests));
    }

    // Check localStorage for saved session
    const storedUser = localStorage.getItem('epusula_user');
    if (storedUser) {
      let parsedUser = JSON.parse(storedUser);
      
      // Streak Reset Logic: Eğer son test tarihinden itibaren 1 günden fazla geçmişse seriyi sıfırla
      if (parsedUser.stats?.lastTestDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastDate = new Date(parsedUser.stats.lastTestDate);
        lastDate.setHours(0, 0, 0, 0);
        
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1 && parsedUser.stats.streak > 0) {
          parsedUser.stats.streak = 0;
          localStorage.setItem('epusula_user', JSON.stringify(parsedUser));
          
          // allUsers listesini de güncelle
          const storedAll = localStorage.getItem('epusula_all_users');
          if (storedAll) {
            const allParsed = JSON.parse(storedAll);
            const updatedAll = allParsed.map(u => 
              u.id === parsedUser.id ? { ...u, stats: { ...u.stats, streak: 0 } } : u
            );
            localStorage.setItem('epusula_all_users', JSON.stringify(updatedAll));
            setAllUsers(updatedAll);
          }
        }
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPass } = foundUser;
      
      // Streak Check on Login
      if (userWithoutPass.stats?.lastTestDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDate = new Date(userWithoutPass.stats.lastTestDate);
        lastDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          userWithoutPass.stats.streak = 0;
          // allUsers listesini de güncel tutalım
          const updatedUsers = allUsers.map(u => 
            u.id === userWithoutPass.id ? { ...u, stats: { ...u.stats, streak: 0 } } : u
          );
          setAllUsers(updatedUsers);
          localStorage.setItem('epusula_all_users', JSON.stringify(updatedUsers));
        }
      }

      setUser(userWithoutPass);
      localStorage.setItem('epusula_user', JSON.stringify(userWithoutPass));
      return { success: true, role: userWithoutPass.role };
    }
    return { success: false, error: 'Geçersiz e-posta veya şifre' };
  };

  const register = (userData) => {
    // Check if email already exists
    if (allUsers.some(u => u.email === userData.email)) {
      return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor.' };
    }

    const newUser = {
      id: Date.now().toString(),
      stats: { streak: 0, totalAnswered: 0, correctAnswers: 0, rank: 0, score: 0 },
      ...userData
    };

    if (userData.role === 'student') {
      // Generate a random 6 digit student number
      newUser.studentNo = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const newUsersList = [...allUsers, newUser];
    setAllUsers(newUsersList);
    localStorage.setItem('epusula_all_users', JSON.stringify(newUsersList));

    const { password: _, ...userWithoutPass } = newUser;
    setUser(userWithoutPass);
    localStorage.setItem('epusula_user', JSON.stringify(userWithoutPass));
    
    return { success: true, role: userWithoutPass.role };
  };

  const updateProfile = (updatedData) => {
    if (!user) return { success: false, error: 'Giriş yapılmamış.' };

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('epusula_user', JSON.stringify(updatedUser));

    // Update in allUsers list (we keep the password intact)
    const newUsersList = allUsers.map(u => {
      if (u.id === updatedUser.id) {
        return { ...u, ...updatedData };
      }
      return u;
    });
    setAllUsers(newUsersList);
    localStorage.setItem('epusula_all_users', JSON.stringify(newUsersList));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('epusula_user');
  };

  // Custom Class Functions
  const createCustomClass = (name) => {
    if (user?.role !== 'teacher') return { success: false, error: 'Sadece öğretmenler sınıf oluşturabilir.' };
    
    // Generate a unique 6-character alphanumeric ID
    const classId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newClass = {
      id: classId,
      name,
      teacherId: user.id,
      studentIds: [],
      createdAt: new Date().toISOString()
    };
    
    const newClasses = [...customClasses, newClass];
    setCustomClasses(newClasses);
    localStorage.setItem('epusula_custom_classes', JSON.stringify(newClasses));
    return { success: true, class: newClass };
  };

  const requestJoinClass = (classId) => {
    if (user?.role !== 'student') return { success: false, error: 'Sadece öğrenciler sınıfa katılabilir.' };
    
    const targetClass = customClasses.find(c => c.id === classId);
    if (!targetClass) return { success: false, error: 'Sınıf bulunamadı.' };
    
    if (targetClass.studentIds.includes(user.id)) return { success: false, error: 'Zaten bu sınıfa kayıtlısınız.' };
    
    if (joinRequests.some(r => r.classId === classId && r.studentId === user.id && r.status === 'pending')) {
      return { success: false, error: 'Bu sınıfa zaten beklemede olan bir isteğiniz var.' };
    }

    const newRequest = {
      id: 'req_' + Date.now(),
      classId,
      studentId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const newRequests = [...joinRequests, newRequest];
    setJoinRequests(newRequests);
    localStorage.setItem('epusula_join_requests', JSON.stringify(newRequests));
    return { success: true, request: newRequest };
  };

  const handleJoinRequest = (requestId, status) => {
    // status: 'accepted' | 'rejected'
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return { success: false, error: 'İstek bulunamadı.' };

    const targetClass = customClasses.find(c => c.id === request.classId);
    if (targetClass.teacherId !== user?.id) return { success: false, error: 'Yetkiniz yok.' };

    const updatedRequests = joinRequests.map(r => 
      r.id === requestId ? { ...r, status } : r
    );
    setJoinRequests(updatedRequests);
    localStorage.setItem('epusula_join_requests', JSON.stringify(updatedRequests));

    if (status === 'accepted') {
      const updatedClasses = customClasses.map(c => 
        c.id === request.classId && !c.studentIds.includes(request.studentId)
          ? { ...c, studentIds: [...c.studentIds, request.studentId] }
          : c
      );
      setCustomClasses(updatedClasses);
      localStorage.setItem('epusula_custom_classes', JSON.stringify(updatedClasses));
    }
    return { success: true };
  };

  const value = {
    user,
    login,
    register,
    updateProfile,
    logout,
    loading,
    allUsers,
    customClasses,
    joinRequests,
    createCustomClass,
    requestJoinClass,
    handleJoinRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
