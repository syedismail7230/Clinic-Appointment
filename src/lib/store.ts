import { useState, useEffect } from 'react';
import { api } from './api';
import { socket } from './socket';

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
  token?: string;
  prescription?: string;
  medicines?: PrescriptionItem[];
  tenantId?: string;
  date?: string;
  clinicId?: string;  // used for WhatsApp booking confirmation deep-link
}

export const getQueue = async (tenantId?: string, date?: string): Promise<QueueItem[]> => {
  const params = new URLSearchParams();
  if (tenantId) params.append('tenantId', tenantId);
  if (date) params.append('date', date);
  const queryString = params.toString();
  const url = queryString ? `/queue?${queryString}` : '/queue';
  return api.get(url);
};

export const updateQueueItem = async (id: string, updates: Partial<QueueItem>) => {
  await api.patch(`/queue/${id}`, updates);
  window.dispatchEvent(new Event('queue_updated'));
};

export const addQueueItem = async (item: QueueItem) => {
  await api.post('/queue', item);
  window.dispatchEvent(new Event('queue_updated'));
};

export const useQueue = (tenantId?: string, date?: string) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const data = await getQueue(tenantId, date);
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    // Listen for socket updates
    socket.on('queue-update', fetchQueue);
    socket.on('global-queue-update', fetchQueue);

    window.addEventListener('queue_updated', fetchQueue);
    return () => {
      socket.off('queue-update', fetchQueue);
      socket.off('global-queue-update', fetchQueue);
      window.removeEventListener('queue_updated', fetchQueue);
    };
  }, [tenantId, date]);

  return queue;
};
