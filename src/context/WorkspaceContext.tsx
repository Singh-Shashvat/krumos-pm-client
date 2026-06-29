/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

import type { Workspace, WorkspaceRole } from '../types/workspace';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeRole: WorkspaceRole | null;
  loadingWorkspaces: boolean;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: string, confirmName: string) => Promise<void>;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  refreshWorkspaces: () => Promise<Workspace[]>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [activeRole, setActiveRole] = useState<WorkspaceRole | null>(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState<boolean>(false);

  const fetchWorkspaces = useCallback(async (): Promise<Workspace[]> => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
      return [];
    }
  }, []);

  const selectWorkspaceInternal = useCallback(
    async (workspace: Workspace, userId: string) => {
      setActiveWorkspace(workspace);
      localStorage.setItem('krumos_active_workspace_id', workspace.id);

      try {
        const res = await api.get(`/workspaces/${workspace.id}/members`);
        const members = res.data;
        const currentMember = members.find(
          (m: { userId: string; role: WorkspaceRole; user?: { id: string } }) =>
            m.userId === userId || m.user?.id === userId
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
    },
    []
  );

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!user) return;
      const matched = workspaces.find((w) => w.id === workspaceId);
      if (matched) {
        await selectWorkspaceInternal(matched, user.id);
      }
    },
    [user, workspaces, selectWorkspaceInternal]
  );

  const createWorkspace = useCallback(
    async (name: string): Promise<Workspace> => {
      const res = await api.post('/workspaces', { name });
      const newWs = res.data;
      setWorkspaces((prev) => [...prev, newWs]);
      if (user) {
        setUser((prev) => (prev ? { ...prev, hasWorkspaces: true } : null));
        await selectWorkspaceInternal(newWs, user.id);
      }
      return newWs;
    },
    [user, setUser, selectWorkspaceInternal]
  );

  const deleteWorkspace = useCallback(
    async (workspaceId: string, confirmName: string): Promise<void> => {
      if (!user) return;
      await api.delete(`/workspaces/${workspaceId}`, { data: { confirmName } });

      const remaining = workspaces.filter((w) => w.id !== workspaceId);
      setWorkspaces(remaining);

      if (remaining.length > 0) {
        await selectWorkspaceInternal(remaining[0], user.id);
      } else {
        setActiveWorkspace(null);
        setActiveRole(null);
        localStorage.removeItem('krumos_active_workspace_id');
        setUser((prev) => (prev ? { ...prev, hasWorkspaces: false } : null));
      }
    },
    [user, setUser, workspaces, selectWorkspaceInternal]
  );

  const refreshWorkspaces = useCallback(async (): Promise<Workspace[]> => {
    return fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Sync workspace logic on user login/logout
  useEffect(() => {
    const initWorkspaces = async () => {
      if (!user) {
        setWorkspaces([]);
        setActiveWorkspace(null);
        setActiveRole(null);
        return;
      }

      if (user.hasWorkspaces) {
        setLoadingWorkspaces(true);
        const list = await fetchWorkspaces();
        if (list.length > 0) {
          const storedId = localStorage.getItem('krumos_active_workspace_id');
          const matched = storedId ? list.find((w) => w.id === storedId) : null;
          const toSelect = matched || list[0];
          await selectWorkspaceInternal(toSelect, user.id);
        }
        setLoadingWorkspaces(false);
      }
    };

    initWorkspaces();
  }, [user, fetchWorkspaces, selectWorkspaceInternal]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeRole,
        loadingWorkspaces,
        selectWorkspace,
        createWorkspace,
        deleteWorkspace,
        setWorkspaces,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
