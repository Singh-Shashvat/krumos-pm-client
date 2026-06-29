export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
}

export type WorkspaceRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
