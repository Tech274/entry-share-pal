import { useState, useEffect } from 'react';
import { LabRequest } from '@/types/labRequest';

const STORAGE_KEY = 'lab-requests';

export const useLabRequests = () => {
  const [requests, setRequests] = useState<LabRequest[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRequests(JSON.parse(stored));
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

  const deleteRequest = (id: string) => {
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setRequests([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { requests, addRequest, deleteRequest, clearAll };
};
