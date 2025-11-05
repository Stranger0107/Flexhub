// src/contexts/AppContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [authLoading, setAuthLoading] = useState(true);

  // ---------------------
  // AUTH
  // ---------------------
  const loginUser = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      toast.error('Invalid login credentials');
      return null;
    }
  };

  const logoutUser = () => {
    if (!window.confirm("Logout?")) return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
    toast.info("Logged out");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setAuthLoading(false);
  }, []);

  // ---------------------
  // STUDENT COURSE ROUTES
  // ---------------------

  // ✅ Fetch all courses available to student
  const getAllCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/api/courses/all');
      return data;
    } catch (err) {
      console.error("getAllCourses failed", err);
      return [];
    }
  }, []);

  // ✅ Fetch only student's enrolled courses (with enrolled flag)
  const getMyStudentCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/api/student/courses/all');
      return data;
    } catch (err) {
      console.error("getMyStudentCourses failed", err);
      return [];
    }
  }, []);

  // ✅ Enroll student
  const enrollInCourse = async (courseId) => {
    try {
      const { data } = await api.post(`/api/student/courses/${courseId}/enroll`);
      return data;
    } catch (err) {
      toast.error("Enrollment failed");
      return null;
    }
  };

  // ✅ Unenroll student
  const unenrollFromCourse = async (courseId) => {
    try {
      const { data } = await api.post(`/api/student/courses/${courseId}/unenroll`);
      return data;
    } catch (err) {
      toast.error("Unenroll failed");
      return null;
    }
  };

  // ---------------------
  // PROFESSOR (unchanged from your code)
  // ---------------------
  const fetchMyProfessorCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/professor/courses');
      return data;
    } catch {
      return [];
    }
  }, []);

  const fetchProfessorCourseById = useCallback(async (courseId) => {
    try {
      const { data } = await api.get(`/professor/courses/${courseId}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  const createProfessorCourse = async (courseData) => {
    try {
      const payload = { ...courseData, teacher: user._id };
      const { data } = await api.post('/professor/courses', payload);
      return data;
    } catch {
      toast.error("Failed to create course");
      return null;
    }
  };

  // ---------------------
  // CONTEXT VALUE
  // ---------------------
  const value = {
    user,
    token,
    loginUser,
    logoutUser,

    // STUDENT
    getAllCourses,
    getMyStudentCourses,
    enrollInCourse,
    unenrollFromCourse,

    // PROFESSOR
    fetchMyProfessorCourses,
    fetchProfessorCourseById,
    createProfessorCourse,
  };

  return (
    <AppContext.Provider value={value}>
      {authLoading ? <div className="flex justify-center items-center h-screen">Initializing Session...</div> : children}
    </AppContext.Provider>
  );
};
