interface PostsResponse {
  statusCode: number;
  data?: PostsData;
  message: string;
  success: boolean;
}
interface PostsData {
  posts?: PostsEntity[];
  totalPages: number;
  currentPage: number;
  user?:User
}
interface PostsEntity {
  id: number;
  user: PostAuthor;
  content: string;
  timestamp: string;
  createdAt?: string;
  originalPost: PostsEntity | null
  privacy: string;
  isBookmarked: boolean;
  likes: number;
  comments: Comments;
  shares: number;
  image?: string;
  media?: string;
  location: string;
  reactions: Reactions;
}
interface PostAuthor {
  id: number;
  full_name: string;
  username: string;
  avatar?: string;
  location?:string
  following_count?:string | number
  followers_count?:string | number
  bio:string
  isFollowing?: boolean;
  privacy_settings?:PrivacySettings
}
interface Comments {
  total: number;
}

interface CommentsResponse{
  statusCode: number
  data: {
    comments: CommentPreview[] | null
    totalPages:number
    currentPage:number
  },
  message:string,
  success:boolean
}
interface CommentPreview {
  id: number;
  content: string;
  user: PostAuthor;
  replies?: RepliesEntity[];
  repliesCount: number;
  reactions: Reactions;
  createdAt: string;
  isEdited:boolean
  parentId:number
  postId?: number
  totalComments?: number
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
  parentId: number;
  postId?:number
  content: string;
  user: PostAuthor;
  repliesCount: number;
  reactions: Reactions;
  createdAt: string;
  isEdited:boolean
  totalComments?:number
}

interface Reactions {
  counts: Counts;
  currentUserReaction?: ReactionType;
}
interface Counts {
  love: number;
}
