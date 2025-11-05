import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [authLoading, setAuthLoading] = useState(true);

  // --- AUTH FUNCTIONS ---
  const loginUser = async (email, password) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token && data.user) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        setAuthLoading(false);
        return data.user;
      } else {
        throw new Error("Login response missing token or user data.");
      }
    } catch (error) {
      console.error('Login failed in context:', error);
      if (error.response?.status === 400 || error.response?.status === 401) {
        toast.error('Invalid email or password.');
      } else {
        toast.error('Failed to login.');
      }
      setAuthLoading(false);
      return null;
    }
  };

  const logoutUser = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setToken(null);
      setUser(null);
      toast.info('You have been logged out.');
    }
  }, []);

  useEffect(() => {
    const loadInitialUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('currentUser');
        }
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('currentUser', JSON.stringify(data));
        } catch (error) {
          console.error("Token verification failed.");
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setToken(null);
          setUser(null);
        }
      }
      setAuthLoading(false);
    };
    loadInitialUser();
  }, []);

  // --- API FUNCTIONS ---

  // --- General ---
  const fetchAllCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/courses');
      return data;
    } catch (error) {
      console.error("API: fetchAllCourses failed", error);
      return [];
    }
  }, []);

  // --- Student ---
  const fetchMyStudentCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/student/courses');
      return data;
    } catch (error) {
      console.error("API: fetchMyStudentCourses failed", error);
      return [];
    }
  }, []);

  const fetchMyGrades = useCallback(async () => {
    try {
      const { data } = await api.get('/student/grades');
      return data;
    } catch (error) {
      console.error("API: fetchMyGrades failed", error);
      return [];
    }
  }, []);

  const submitAssignment = async (assignmentId, submissionText) => {
    try {
      const { data } = await api.post(`/student/assignments/${assignmentId}/submit`, {
        submission: submissionText,
      });
      toast.success("Assignment submitted successfully!");
      return data;
    } catch (error) {
      console.error("API: submitAssignment failed", error);
      toast.error("Failed to submit assignment.");
      return null;
    }
  };

  // --- Professor ---
  const fetchMyProfessorCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/professor/courses');
      return data;
    } catch (error) {
      console.error("API: fetchMyProfessorCourses failed", error);
      return [];
    }
  }, []);

  const fetchProfessorAssignments = useCallback(async () => {
    try {
      const { data } = await api.get('/professor/assignments');
      return data;
    } catch (error) {
      console.error("API: fetchProfessorAssignments failed", error);
      return [];
    }
  }, []);

  const fetchProfessorCourseById = useCallback(async (courseId) => {
    try {
      const { data } = await api.get(`/professor/courses/${courseId}`);
      return data;
    } catch (error) {
      console.error("API: fetchProfessorCourseById failed", error);
      return null;
    }
  }, []);

  const fetchAssignmentsForCourse = useCallback(async (courseId) => {
    try {
      const { data } = await api.get(`/assignments/course/${courseId}`);
      return data;
    } catch (error) {
      console.error("API: fetchAssignmentsForCourse failed", error);
      return [];
    }
  }, []);

  const createProfessorCourse = async (courseData) => {
    try {
      const { data } = await api.post('/professor/courses', courseData);
      toast.success("Course created!");
      return data;
    } catch (error) {
      console.error("API: createProfessorCourse failed", error);
      toast.error("Failed to create course.");
      return null;
    }
  };

  const updateProfessorCourse = async (courseId, updateData) => {
    try {
      const { data } = await api.put(`/professor/courses/${courseId}`, updateData);
      toast.success("Course updated!");
      return data;
    } catch (error) {
      console.error("API: updateProfessorCourse failed", error);
      toast.error("Failed to update course.");
      return null;
    }
  };

  const deleteProfessorCourse = async (courseId) => {
    try {
      await api.delete(`/professor/courses/${courseId}`);
      toast.success("Course deleted!");
      return true;
    } catch (error) {
      console.error("API: deleteProfessorCourse failed", error);
      toast.error("Failed to delete course.");
      return false;
    }
  };

  const gradeSubmission = async (assignmentId, studentId, { grade, feedback }) => {
    try {
      const { data } = await api.post(`/professor/assignments/${assignmentId}/grade`, {
        studentId,
        grade,
        feedback,
      });
      toast.success("Submission graded successfully!");
      return data;
    } catch (error) {
      console.error("API: gradeSubmission failed", error);
      toast.error("Failed to grade submission.");
      return null;
    }
  };

  // ✅ Permanent Profile Update (Fixed)
  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await api.put('/professor/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      console.error("API: updateUserProfile failed", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
      return null;
    }
  };

  const createAssignment = async (assignmentData) => {
    try {
      const { data } = await api.post('/assignments', assignmentData);
      toast.success("Assignment created!");
      return data;
    } catch (error) {
      console.error("API: createAssignment failed", error);
      toast.error("Failed to create assignment.");
      return null;
    }
  };

  // --- Admin Routes ---
  const fetchAllUsersAdmin = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      return data;
    } catch (error) {
      console.error("API: fetchAllUsersAdmin failed", error);
      return [];
    }
  }, []);

  const createCourse = async (courseData) => {
    try {
      const { data } = await api.post('/admin/courses', courseData);
      toast.success("Course created by admin!");
      return data;
    } catch (error) {
      console.error("API: createCourse failed", error);
      toast.error("Failed to create course.");
      return null;
    }
  };

  const updateCourse = async (courseId, updateData) => {
    try {
      const { data } = await api.put(`/admin/courses/${courseId}`, updateData);
      toast.success("Course updated by admin!");
      return data;
    } catch (error) {
      console.error("API: updateCourse failed", error);
      toast.error("Failed to update course.");
      return null;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await api.delete(`/admin/courses/${courseId}`);
      toast.success("Course deleted by admin!");
      return true;
    } catch (error) {
      console.error("API: deleteCourse failed", error);
      toast.error("Failed to delete course.");
      return false;
    }
  };

  const createUser = async (userData) => {
    try {
      const { data } = await api.post('/admin/users', userData);
      toast.success("User created!");
      return data;
    } catch (error) {
      console.error("API: createUser failed", error);
      toast.error("Failed to create user.");
      return null;
    }
  };

  // --- Context Value ---
  const value = {
    user,
    token,
    authLoading,
    loginUser,
    logoutUser,
    fetchAllUsersAdmin,
    createUser,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchMyStudentCourses,
    fetchMyGrades,
    submitAssignment,
    fetchMyProfessorCourses,
    fetchProfessorAssignments,
    gradeSubmission,
    updateUserProfile,
    createProfessorCourse,
    updateProfessorCourse,
    deleteProfessorCourse,
    fetchProfessorCourseById,
    fetchAssignmentsForCourse,
    createAssignment,
    fetchAllCourses,
  };

  return (
    <AppContext.Provider value={value}>
      {authLoading ? (
        <div className="flex justify-center items-center h-screen">
          Initializing Session...
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
};
