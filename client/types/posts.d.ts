interface PostsResponse {
  statusCode: number;
  data: PostsData;
  message: string;
  success: boolean;
}
interface PostsData {
  posts?: PostsEntity[] | null;
  totalPages: number;
  currentPage: number;
}
interface PostsEntity {
  id: number;
  user: PostAuthor;
  content: string;
  timestamp: string;
  isBookmarked: boolean;
  likes: number;
  comments: Comments;
  shares: number;
  image?: string;
  location: string;
  reactions: Reactions;
}
interface PostAuthor {
  id: number;
  name: string;
  username: string;
  avatar?: string;
}
interface Comments {
  total: number;
  preview?: CommentPreview[] | null;
}
interface CommentPreview {
  id: number;
  content: string;
  user: PostAuthor;
  replies?: RepliesEntity[];
  repliesCount: number;
  reactions: Reactions;
  createdAt: string;
}

type ReactionType =
  | "like"
  | "love"
  | "haha"
  | "care"
  | "sad"
  | "wow"
  | "angry"
  | null;

interface RepliesEntity {
  id: number;
  content: string;
  user: PostAuthor;
  repliesCount: number;
  reactions: Reactions;
  createdAt: string;
}

interface Reactions {
  counts: Counts;
  currentUserReaction?: ReactionType;
}
interface Counts {
  love: number;
}
