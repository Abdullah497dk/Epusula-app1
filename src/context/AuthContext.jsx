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
    // Helper to get calendar day difference
    const getDaysDiff = (date1, date2) => {
      const d1 = new Date(date1);
      d1.setHours(0, 0, 0, 0);
      const d2 = new Date(date2);
      d2.setHours(0, 0, 0, 0);
      return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
    };

    // Load users from local storage or initialize with mockData
    const storedUsers = localStorage.getItem('epusula_all_users');
    let currentAllUsers = [];
    if (storedUsers) {
      currentAllUsers = JSON.parse(storedUsers);
      // Ensure Ahmet Adil exists for the example
      if (!currentAllUsers.find(u => u.email === 'ahmetadil@epusula.net')) {
        const ahmetAdil = initialUsers.find(u => u.email === 'ahmetadil@epusula.net');
        if (ahmetAdil) {
          currentAllUsers.push(ahmetAdil);
          localStorage.setItem('epusula_all_users', JSON.stringify(currentAllUsers));
        }
      }
    } else {
      currentAllUsers = initialUsers;
      localStorage.setItem('epusula_all_users', JSON.stringify(initialUsers));
    }
    setAllUsers(currentAllUsers);

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
      
      // Streak Reset Logic: Gün sonu kontrolü
      if (parsedUser.stats?.lastTestDate) {
        const today = new Date();
        const diffDays = getDaysDiff(today, parsedUser.stats.lastTestDate);
        
        // Eğer 1 günden fazla geçmişse (yani dün pas geçilmişse) seriyi sıfırla
        if (diffDays > 1 && parsedUser.stats.streak > 0) {
          parsedUser.stats.streak = 0;
          localStorage.setItem('epusula_user', JSON.stringify(parsedUser));
          
          // allUsers listesini de güncelle
          const updatedAll = currentAllUsers.map(u => 
            u.id === parsedUser.id ? { ...u, stats: { ...u.stats, streak: 0 } } : u
          );
          localStorage.setItem('epusula_all_users', JSON.stringify(updatedAll));
          setAllUsers(updatedAll);
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
      
      // Activity Log on Login
      const now = new Date().toISOString();
      const loginActivity = { type: 'login', date: now };
      
      // Streak Check on Login
      if (userWithoutPass.stats?.lastTestDate) {
        const today = new Date();
        const lastDate = new Date(userWithoutPass.stats.lastTestDate);
        
        const d1 = new Date(today);
        d1.setHours(0, 0, 0, 0);
        const d2 = new Date(lastDate);
        d2.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          if (!userWithoutPass.stats) userWithoutPass.stats = {};
          userWithoutPass.stats.streak = 0;
        }
      }

      // Update allUsers with new activity and potential streak reset
      const updatedUsers = allUsers.map(u => {
        if (u.id === userWithoutPass.id) {
          const log = u.activityLog || [];
          return { 
            ...u, 
            stats: { ...u.stats, streak: userWithoutPass.stats?.streak || 0 },
            activityLog: [loginActivity, ...log].slice(0, 50) 
          };
        }
        return u;
      });
      setAllUsers(updatedUsers);
      localStorage.setItem('epusula_all_users', JSON.stringify(updatedUsers));

      const updatedUserWithActivity = { 
        ...userWithoutPass, 
        activityLog: [loginActivity, ...(userWithoutPass.activityLog || [])].slice(0, 50) 
      };

      setUser(updatedUserWithActivity);
      localStorage.setItem('epusula_user', JSON.stringify(updatedUserWithActivity));
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
      activityLog: [],
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

  const addActivity = (userId, activity) => {
    // activity: { type: 'login' | 'test_completed', count?: number, date: string }
    const newUsersList = allUsers.map(u => {
      if (u.id === userId) {
        const log = u.activityLog || [];
        return { ...u, activityLog: [activity, ...log].slice(0, 50) };
      }
      return u;
    });
    setAllUsers(newUsersList);
    localStorage.setItem('epusula_all_users', JSON.stringify(newUsersList));
    
    if (user?.id === userId) {
      const updatedUser = { ...user, activityLog: [activity, ...(user.activityLog || [])].slice(0, 50) };
      setUser(updatedUser);
      localStorage.setItem('epusula_user', JSON.stringify(updatedUser));
    }
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
    handleJoinRequest,
    addActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
