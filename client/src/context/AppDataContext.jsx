import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const { token, API_URL } = useAuth();
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Helper for authenticated headers
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  // --- STUDENT API ---
  const fetchStudents = useCallback(async (filters = {}) => {
    if (!token) return;
    setLoadingData(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.minCgpa) params.append('minCgpa', filters.minCgpa);
      if (filters.maxCgpa) params.append('maxCgpa', filters.maxCgpa);

      const res = await fetch(`${API_URL}/students?${params.toString()}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingData(false);
    }
  }, [API_URL, getHeaders, token]);

  const createStudent = async (studentData) => {
    try {
      const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) => [data.data, ...prev]);
        fetchDashboardStats(); // Refresh dashboard
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error creating student' };
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const res = await fetch(`${API_URL}/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) =>
          prev.map((student) => (student._id === id ? data.data : student))
        );
        fetchDashboardStats(); // Refresh stats
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error updating student' };
    }
  };

  const deleteStudent = async (id) => {
    try {
      const res = await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) => prev.filter((student) => student._id !== id));
        fetchDashboardStats();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error deleting student' };
    }
  };

  // --- COMPANY API ---
  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/companies`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingData(false);
    }
  }, [API_URL, getHeaders, token]);

  const fetchCompanyById = async (id) => {
    try {
      const res = await fetch(`${API_URL}/companies/${id}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching company:', err);
      return null;
    }
  };

  const createCompany = async (companyData) => {
    try {
      const res = await fetch(`${API_URL}/companies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(companyData),
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
        fetchDashboardStats();
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error creating company' };
    }
  };

  const updateCompany = async (id, companyData) => {
    try {
      const res = await fetch(`${API_URL}/companies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(companyData),
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
        fetchDashboardStats();
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error updating company' };
    }
  };

  const deleteCompany = async (id) => {
    try {
      const res = await fetch(`${API_URL}/companies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCompanies((prev) => prev.filter((company) => company._id !== id));
        fetchDashboardStats();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error deleting company' };
    }
  };

  // --- ROUND API ---
  const fetchRoundCandidates = async (roundId) => {
    try {
      const res = await fetch(`${API_URL}/rounds/${roundId}/candidates`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching candidates:', err);
      return null;
    }
  };

  const registerCandidates = async (roundId, studentIds) => {
    try {
      const res = await fetch(`${API_URL}/rounds/${roundId}/candidates/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ studentIds }),
      });
      const data = await res.json();
      return data.success ? { success: true } : { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error registering candidates' };
    }
  };

  const recordAttendance = async (roundId, attendanceData) => {
    try {
      const res = await fetch(`${API_URL}/rounds/${roundId}/attendance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ attendanceData }),
      });
      const data = await res.json();
      return data.success ? { success: true } : { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error saving attendance' };
    }
  };

  const recordResults = async (roundId, resultData) => {
    try {
      const res = await fetch(`${API_URL}/rounds/${roundId}/results`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ resultData }),
      });
      const data = await res.json();
      return data.success ? { success: true } : { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error saving results' };
    }
  };

  // --- DASHBOARD API ---
  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, [API_URL, getHeaders, token]);

  return (
    <AppDataContext.Provider
      value={{
        students,
        companies,
        dashboardStats,
        loadingData,
        fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        fetchCompanies,
        fetchCompanyById,
        createCompany,
        updateCompany,
        deleteCompany,
        fetchRoundCandidates,
        registerCandidates,
        recordAttendance,
        recordResults,
        fetchDashboardStats,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
