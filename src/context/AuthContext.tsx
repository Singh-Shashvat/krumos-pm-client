import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  createdAt: string;
  hasWorkspaces: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
}

export type WorkspaceRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeRole: WorkspaceRole | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: string, confirmName: string) => Promise<void>;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [activeRole, setActiveRole] = useState<WorkspaceRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem('krumos_token');
    localStorage.removeItem('krumos_active_workspace_id');
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setActiveRole(null);
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
      return [];
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('krumos_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const userData = res.data;
      setUser(userData);

      if (userData.hasWorkspaces) {
        const workspaceList = await fetchWorkspaces();
        if (workspaceList.length > 0) {
          // Only select workspace if it was previously stored in local storage
          const storedId = localStorage.getItem('krumos_active_workspace_id');
          if (storedId) {
            const matched = workspaceList.find(
              (w: Workspace) => w.id === storedId
            );
            if (matched) {
              await selectWorkspaceInternal(matched, userData.id);
            }
          }
        }
      }
    } catch (err) {
      console.error('Session validation failed, logging out', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspaceInternal = async (
    workspace: Workspace,
    userId: string
  ) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('krumos_active_workspace_id', workspace.id);

    try {
      // Find role by fetching members list and filtering for current user
      const res = await api.get(`/workspaces/${workspace.id}/members`);
      const members = res.data;
      const currentMember = members.find(
        (m: any) => m.userId === userId || m.user?.id === userId
      );
      if (currentMember) {
        setActiveRole(currentMember.role);
      } else {
        setActiveRole(null);
      }
    } catch (err) {
      console.error('Failed to resolve workspace role', err);
      setActiveRole(null);
    }
  };

  const selectWorkspace = async (workspaceId: string) => {
    if (!user) return;
    const matched = workspaces.find((w) => w.id === workspaceId);
    if (matched) {
      await selectWorkspaceInternal(matched, user.id);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace> => {
    const res = await api.post('/workspaces', { name });
    const newWs = res.data;
    setWorkspaces((prev) => [...prev, newWs]);
    if (user) {
      setUser((prev) => (prev ? { ...prev, hasWorkspaces: true } : null));
      await selectWorkspaceInternal(newWs, user.id);
    }
    return newWs;
  };

  const deleteWorkspace = async (
    workspaceId: string,
    confirmName: string
  ): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`, { data: { confirmName } });

    // Filter out the deleted workspace from state
    const remaining = workspaces.filter((w) => w.id !== workspaceId);
    setWorkspaces(remaining);

    if (remaining.length > 0) {
      // Select the first remaining workspace
      await selectWorkspaceInternal(remaining[0], user!.id);
    } else {
      // No workspaces left
      setActiveWorkspace(null);
      setActiveRole(null);
      localStorage.removeItem('krumos_active_workspace_id');
      if (user) {
        setUser({ ...user, hasWorkspaces: false });
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        activeRole,
        loading,
        loginWithGoogle,
        logout,
        refreshUser,
        selectWorkspace,
        createWorkspace,
        deleteWorkspace,
        setWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
