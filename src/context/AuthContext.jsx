import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Load users from local storage or initialize with mockData
    const storedUsers = localStorage.getItem('epusula_all_users');
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    } else {
      setAllUsers(initialUsers);
      localStorage.setItem('epusula_all_users', JSON.stringify(initialUsers));
    }

    // Check localStorage for saved session
    const storedUser = localStorage.getItem('epusula_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPass } = foundUser;
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

  const value = {
    user,
    login,
    register,
    updateProfile,
    logout,
    loading,
    allUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
