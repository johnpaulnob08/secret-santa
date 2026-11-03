import { createContext, useContext, useState, useCallback } from 'react';
import { groupsApi } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('adminEmail') || '');
  const [loading, setLoading] = useState(false);

  const setAdmin = useCallback((email) => {
    setAdminEmail(email);
    localStorage.setItem('adminEmail', email);
  }, []);

  const fetchGroups = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await groupsApi.getAll(email);
      setGroups(res.data.groups || []);
    } catch (e) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeGroup = useCallback((id) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const upsertGroup = useCallback((group) => {
    setGroups(prev => {
      const idx = prev.findIndex(g => g.id === group.id);
      if (idx === -1) return [group, ...prev];
      const next = [...prev];
      next[idx] = group;
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{ groups, adminEmail, loading, setAdmin, fetchGroups, removeGroup, upsertGroup }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);