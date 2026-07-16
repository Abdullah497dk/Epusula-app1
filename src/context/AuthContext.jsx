import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [customClasses, setCustomClasses] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  // Helper to get calendar day difference
  const getDaysDiff = (date1, date2) => {
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
  };

  const refreshUserData = async (currentUserId = null) => {
    const activeId = currentUserId || (await supabase.auth.getSession()).data.session?.user?.id;
    if (!activeId) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 1. Fetch current profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', activeId).single();
    if (profile) {
      // Fetch activity logs and details
      const { data: activities } = await supabase.from('activities')
        .select(`
          id,
          type,
          count,
          total,
          date,
          answers (
            question_id,
            unit_id,
            is_correct
          )
        `)
        .eq('user_id', activeId)
        .order('date', { ascending: false })
        .limit(50);

      // Reconstruct activityLog format to match original frontend shape
      const activityLog = (activities || []).map(act => {
        if (act.type === 'test_completed') {
          return {
            type: 'test_completed',
            count: act.count,
            total: act.total,
            date: act.date,
            details: (act.answers || []).map(ans => ({
              id: ans.question_id,
              unitId: ans.unit_id,
              isCorrect: ans.is_correct
            }))
          };
        }
        return {
          type: 'login',
          date: act.date
        };
      });

      // Streak Reset Logic: Gün sonu kontrolü
      let streakVal = profile.streak;
      if (profile.last_test_date) {
        const today = new Date();
        const diffDays = getDaysDiff(today, profile.last_test_date);
        
        // Eğer 1 günden fazla geçmişse (yani dün pas geçilmişse) seriyi sıfırla
        if (diffDays > 1 && profile.streak > 0) {
          streakVal = 0;
          await supabase.from('profiles').update({ streak: 0 }).eq('id', profile.id);
        }
      }

      // Construct frontend user object matching CamelCase/structure expectation
      const frontendUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        classId: profile.class_id,
        studentNo: profile.student_no,
        bio: profile.bio,
        phone: profile.phone,
        profilePic: profile.profile_pic,
        stats: {
          streak: streakVal,
          totalAnswered: profile.total_answered,
          correctAnswers: profile.correct_answers,
          score: profile.score,
          lastTestDate: profile.last_test_date,
          todaysAnswers: profile.todays_answers || {},
          todaysCorrectCount: profile.todays_correct_count
        },
        activityLog
      };

      setUser(frontendUser);
    }

    // 2. Fetch all users/profiles (mostly for leaderboard and class mappings)
    const { data: allProfiles } = await supabase.from('profiles').select('*');
    if (allProfiles) {
      const mappedProfiles = allProfiles.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        classId: p.class_id,
        studentNo: p.student_no,
        bio: p.bio,
        phone: p.phone,
        profilePic: p.profile_pic,
        stats: {
          streak: p.streak,
          totalAnswered: p.total_answered,
          correctAnswers: p.correct_answers,
          score: p.score,
          lastTestDate: p.last_test_date,
          todaysAnswers: p.todays_answers || {},
          todaysCorrectCount: p.todays_correct_count
        }
      }));
      setAllUsers(mappedProfiles);
    }

    // 3. Fetch custom classes
    const { data: classes } = await supabase.from('custom_classes').select('*');
    if (classes) {
      const { data: members } = await supabase.from('class_members').select('*');
      const mappedClasses = classes.map(c => {
        const studentIds = (members || [])
          .filter(m => m.class_id === c.id)
          .map(m => m.student_id);
        return {
          id: c.id,
          name: c.name,
          teacherId: c.teacher_id,
          studentIds,
          createdAt: c.created_at
        };
      });
      setCustomClasses(mappedClasses);
    }

    // 4. Fetch join requests
    const { data: reqs } = await supabase.from('join_requests').select('*');
    if (reqs) {
      const mappedReqs = reqs.map(r => ({
        id: r.id,
        classId: r.class_id,
        studentId: r.student_id,
        status: r.status,
        createdAt: r.created_at
      }));
      setJoinRequests(mappedReqs);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Auth State change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await refreshUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refreshUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message === 'Invalid login credentials' ? 'Geçersiz e-posta veya şifre' : error.message };
    }

    // Create login activity
    const now = new Date().toISOString();
    await supabase.from('activities').insert({
      user_id: data.user.id,
      type: 'login',
      date: now
    });

    await refreshUserData(data.user.id);
    // Fetch profile to know role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    return { success: true, role: profile?.role };
  };

  const register = async (userData) => {
    const { email, password, name, role, classId } = userData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          classId
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Create initial login activity
      await supabase.from('activities').insert({
        user_id: data.user.id,
        type: 'login',
        date: new Date().toISOString()
      });
      await refreshUserData(data.user.id);
    }

    return { success: true, role };
  };

  const updateProfile = async (updatedData) => {
    if (!user) return { success: false, error: 'Giriş yapılmamış.' };

    const updateObj = {};
    if (updatedData.name !== undefined) updateObj.name = updatedData.name;
    if (updatedData.bio !== undefined) updateObj.bio = updatedData.bio;
    if (updatedData.phone !== undefined) updateObj.phone = updatedData.phone;
    if (updatedData.profilePic !== undefined) updateObj.profile_pic = updatedData.profilePic;
    if (updatedData.classId !== undefined) updateObj.class_id = updatedData.classId;

    if (updatedData.stats) {
      const s = updatedData.stats;
      if (s.streak !== undefined) updateObj.streak = s.streak;
      if (s.totalAnswered !== undefined) updateObj.total_answered = s.totalAnswered;
      if (s.correctAnswers !== undefined) updateObj.correct_answers = s.correctAnswers;
      if (s.score !== undefined) updateObj.score = s.score;
      if (s.lastTestDate !== undefined) updateObj.last_test_date = s.lastTestDate;
      if (s.todaysAnswers !== undefined) updateObj.todays_answers = s.todaysAnswers;
      if (s.todaysCorrectCount !== undefined) updateObj.todays_correct_count = s.todaysCorrectCount;
    }

    const { error } = await supabase.from('profiles').update(updateObj).eq('id', user.id);
    if (error) {
      return { success: false, error: error.message };
    }

    await refreshUserData(user.id);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addActivity = async (userId, activity) => {
    const { data: act, error } = await supabase.from('activities').insert({
      user_id: userId,
      type: activity.type,
      count: activity.count,
      total: activity.total,
      date: activity.date || new Date().toISOString()
    }).select().single();

    if (error) return;

    if (activity.details && act) {
      const answersToInsert = activity.details.map(det => ({
        activity_id: act.id,
        question_id: det.id,
        unit_id: det.unitId,
        is_correct: det.isCorrect
      }));
      await supabase.from('answers').insert(answersToInsert);
    }
    await refreshUserData(userId);
  };

  const createCustomClass = async (name) => {
    if (user?.role !== 'teacher') return { success: false, error: 'Sadece öğretmenler sınıf oluşturabilir.' };
    const classId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase.from('custom_classes').insert({
      id: classId,
      name,
      teacher_id: user.id
    });

    if (error) return { success: false, error: error.message };
    await refreshUserData(user.id);
    return { success: true };
  };

  const requestJoinClass = async (classId) => {
    if (user?.role !== 'student') return { success: false, error: 'Sadece öğrenciler sınıfa katılabilir.' };
    
    const { error } = await supabase.from('join_requests').insert({
      class_id: classId,
      student_id: user.id,
      status: 'pending'
    });

    if (error) return { success: false, error: error.message };
    await refreshUserData(user.id);
    return { success: true };
  };

  const handleJoinRequest = async (requestId, status) => {
    const { data: req, error: getErr } = await supabase.from('join_requests').select('*').eq('id', requestId).single();
    if (getErr || !req) return { success: false, error: 'İstek bulunamadı.' };

    const { error: updateErr } = await supabase.from('join_requests').update({ status }).eq('id', requestId);
    if (updateErr) return { success: false, error: updateErr.message };

    if (status === 'accepted') {
      const { error: memberErr } = await supabase.from('class_members').insert({
        class_id: req.class_id,
        student_id: req.student_id
      });
      if (memberErr) return { success: false, error: memberErr.message };
    }
    await refreshUserData(user.id);
    return { success: true };
  };

  const updateClassName = async (classId, newName) => {
    const { error } = await supabase.from('custom_classes').update({ name: newName }).eq('id', classId);
    if (error) return { success: false, error: error.message };
    await refreshUserData(user.id);
    return { success: true };
  };

  const removeStudentFromClass = async (classId, studentId) => {
    const { error } = await supabase.from('class_members').delete().eq('class_id', classId).eq('student_id', studentId);
    if (error) return { success: false, error: error.message };
    await refreshUserData(user.id);
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
    addActivity,
    updateClassName,
    removeStudentFromClass
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
