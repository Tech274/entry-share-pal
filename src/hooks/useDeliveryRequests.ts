import { useState, useEffect } from 'react';
import { DeliveryRequest } from '@/types/deliveryRequest';

const STORAGE_KEY = 'delivery-requests';

export const useDeliveryRequests = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRequests(JSON.parse(stored));
    }
  }, []);

  const addRequest = (request: Omit<DeliveryRequest, 'id' | 'createdAt'>) => {
    const newRequest: DeliveryRequest = {
      ...request,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...requests, newRequest];
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRequest;
  };

  const updateRequest = (id: string, updates: Partial<Omit<DeliveryRequest, 'id' | 'createdAt'>>) => {
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
