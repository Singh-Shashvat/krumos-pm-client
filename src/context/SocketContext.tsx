import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api, { API_BASE_URL } from '../services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  registerListener: (
    event: string,
    callback: (...args: any[]) => void
  ) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, activeWorkspace } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const listenersRef = useRef<{
    [event: string]: ((...args: any[]) => void)[];
  }>({});

  const fetchNotifications = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await api.get(
        `/workspaces/${activeWorkspace.id}/notifications`
      );
      setNotifications(res.data);
      const unread = res.data.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!activeWorkspace) return;
    try {
      await api.patch(
        `/workspaces/${activeWorkspace.id}/notifications/${notificationId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    if (!activeWorkspace) return;
    try {
      await api.post(
        `/workspaces/${activeWorkspace.id}/notifications/read-all`
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const registerListener = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      listenersRef.current = {
        ...listenersRef.current,
        [event]: [...(listenersRef.current[event] || []), callback],
      };

      if (socket) {
        socket.on(event, callback);
      }

      return () => {
        listenersRef.current = {
          ...listenersRef.current,
          [event]: (listenersRef.current[event] || []).filter(
            (cb) => cb !== callback
          ),
        };
        if (socket) {
          socket.off(event, callback);
        }
      };
    },
    [socket]
  );

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = API_BASE_URL;
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket.io connected');
      setConnected(true);

      // Join rooms
      newSocket.emit('join_user', { userId: user.id });
      if (activeWorkspace) {
        newSocket.emit('join_workspace', { workspaceId: activeWorkspace.id });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setConnected(false);
    });

    // Handle incoming real-time notifications
    newSocket.on(
      'notification_created',
      (data: { notification: Notification; unreadCount: number }) => {
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
        }
        setUnreadCount(data.unreadCount);
      }
    );

    // Re-bind all active dynamic listeners when socket gets recreated
    Object.keys(listenersRef.current).forEach((event) => {
      listenersRef.current[event].forEach((callback) => {
        newSocket.on(event, callback);
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Handle active workspace changing
  useEffect(() => {
    if (socket && activeWorkspace) {
      socket.emit('join_workspace', { workspaceId: activeWorkspace.id });
      fetchNotifications();
    }
  }, [activeWorkspace, socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        registerListener,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
