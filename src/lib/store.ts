import { useState, useEffect } from 'react';
import { MOCK_QUEUE } from './mockData';

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  frequency: string;
  duration: string;
}

export interface QueueItem {
  id: string;
  patientName: string;
  phone: string;
  status: string; // 'booked', 'waiting', 'in-consultation', 'completed'
  doctor: string;
  time: string;
  waitTime: string;
  token: string;
  prescription?: string;
  medicines?: PrescriptionItem[];
}

const QUEUE_KEY = 'quickcare_queue';

export const getQueue = (): QueueItem[] => {
  const stored = localStorage.getItem(QUEUE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with mock data
  const initial = MOCK_QUEUE.map((q, i) => ({
    ...q,
    token: `A-${41 + i}`,
    prescription: '',
    medicines: []
  }));
  localStorage.setItem(QUEUE_KEY, JSON.stringify(initial));
  return initial;
};

export const updateQueueItem = (id: string, updates: Partial<QueueItem>) => {
  const queue = getQueue();
  const updated = queue.map(q => q.id === id ? { ...q, ...updates } : q);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('queue_updated'));
};

export const addQueueItem = (item: QueueItem) => {
  const queue = getQueue();
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event('queue_updated'));
};

export const useQueue = () => {
  const [queue, setQueue] = useState<QueueItem[]>(getQueue());

  useEffect(() => {
    const handleStorage = () => {
      setQueue(getQueue());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('queue_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('queue_updated', handleStorage);
    };
  }, []);

  return queue;
};
