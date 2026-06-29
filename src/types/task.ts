export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    picture: string;
  };
}

export interface ActivityLog {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
  performer: {
    id: string;
    name: string;
  } | null;
}
