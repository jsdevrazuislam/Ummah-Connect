export interface CommentResponse {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
  };
  replies: CommentResponse[];
  repliesCount: number;
  reactions: {
    counts: Record<string, number>;
    currentUserReaction: string | null;
  };
}

export interface ReactPostType {
  react_type: string;
  userId: number
}
