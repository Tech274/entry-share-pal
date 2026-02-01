import { useState, useEffect } from 'react';
import { LabRequest } from '@/types/labRequest';
import { sampleLabRequests } from '@/lib/sampleData';

const STORAGE_KEY = 'lab-requests';

export const useLabRequests = () => {
  const [requests, setRequests] = useState<LabRequest[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRequests(JSON.parse(stored));
    } else {
      // Seed with sample data if empty
      const seeded = sampleLabRequests.map(r => ({
        ...r,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }));
      setRequests(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
  }, []);

  const addRequest = (request: Omit<LabRequest, 'id' | 'createdAt'>) => {
    const newRequest: LabRequest = {
      ...request,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...requests, newRequest];
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRequest;
  };

  const updateRequest = (id: string, updates: Partial<Omit<LabRequest, 'id' | 'createdAt'>>) => {
    const updated = requests.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteRequest = (id: string) => {
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setRequests([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { requests, addRequest, updateRequest, deleteRequest, clearAll };
};
