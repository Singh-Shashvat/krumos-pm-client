export interface Member {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
}

export interface Invitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
}
