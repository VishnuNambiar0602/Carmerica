import { useState, useEffect } from 'react';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const es = new EventSource(`/api/notifications/stream?userId=${encodeURIComponent(userId)}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse notifications data:', err);
      }
    };
    es.onerror = (err) => {
      console.error('[SSE] EventSource error:', err);
    };
    return () => es.close();
  }, [userId]);

  return { notifications, unreadCount };
}
