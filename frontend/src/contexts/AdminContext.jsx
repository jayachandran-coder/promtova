import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api, { fetchPrompts, fetchAnalytics, fetchRequests, fetchAllUsers } from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [prompts, setPrompts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isFetching = useRef(false);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    if (!silent) setLoading(true);
    
    try {
      const [pRes, aRes, rRes, uRes] = await Promise.all([
        fetchPrompts().catch(() => ({ data: [] })),
        fetchAnalytics().catch(() => ({ data: { totalPrompts: 0, totalUsers: 0, totalLikes: 0, totalCopies: 0, totalSaves: 0 } })),
        fetchRequests().catch(() => ({ data: [] })),
        fetchAllUsers().catch(() => ({ data: [] }))
      ]);
      
      setPrompts(Array.isArray(pRes.data) ? pRes.data : []);
      setAnalytics(aRes.data);
      setRequests(Array.isArray(rRes.data) ? rRes.data : []);
      setUsers(Array.isArray(uRes.data) ? uRes.data : []);
    } catch (err) {
    } finally {
      isFetching.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchDashboardData(true); // Silent refresh
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData(); // Initial load
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds for a "real-time" feel without overwhelming the server
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const value = {
    prompts,
    setPrompts,
    analytics,
    setAnalytics,
    requests,
    setRequests,
    users,
    setUsers,
    loading,
    refreshAll
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
