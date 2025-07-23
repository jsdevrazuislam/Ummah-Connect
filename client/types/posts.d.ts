interface PostsResponse {
  statusCode: number;
  data?: PostsData;
  message: string;
  success: boolean;
}
interface BookmarkPostsResponse {
  statusCode: number;
  data?: BookmarkPostsData;
  message: string;
  success: boolean;
}

interface BookmarkPostsData{
  posts?: BookmarkPostEntity[];
  totalPages: number;
  currentPage: number;
  user?:User
}

interface BookmarkPostEntity{
  createdAt:string
  updatedAt:string
  id:number
  userId:number
  postId:number
  post:PostsEntity
}
interface PostsData {
  posts?: PostsEntity[];
  totalPages: number;
  currentPage: number;
  user?:User
}
interface PostsEntity {
  id: number;
  authorId: number;
  user: PostAuthor;
  content: string;
  timestamp: string;
  createdAt?: string;
  originalPost: PostsEntity | null
  privacy: string;
  background: string;
  isBookmarked: boolean;
  totalReactionsCount: number;
  totalCommentsCount: number;
  currentUserReaction: ReactionType;
  share: number;
  media?: string;
  media?: string;
  location: string;
  createdAt?:string
  contentType?: 'text' | 'video' | 'audio' | 'picture'
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
  userId: number;
  content: string;
  user: PostAuthor;
  replies?: RepliesEntity[];
  repliesCount: number;
  createdAt: string;
  isEdited:boolean
  parentId:number
  postId?: number
  totalComments?: number
  totalReactionsCount?: number
  currentUserReaction: ReactionType

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
  userId: number;
  id: number;
  parentId: number;
  postId?:number
  content: string;
  user: PostAuthor;
  repliesCount: number;
  createdAt: string;
  isEdited:boolean
  totalComments?:number
  totalReactionsCount?: number
  currentUserReaction: ReactionType
}
interface Counts {
  love: number;
}


 interface SuggestionUsers {
  statusCode: number;
  data?: (SuggestionEntity)[] | null;
  message: string;
  success: boolean;
}
 interface SuggestionEntity {
  id: number;
  username: string;
  avatar?: null;
  full_name: string;
  follower_count: string;
  is_following: boolean;
}


  interface StoryResponse {
  statusCode: number;
  data?: (DataEntity)[] | null;
  message: string;
  success: boolean;
}
 interface StoryEntity {
  id: number;
  username: string;
  avatar?: null;
  full_name: string;
  stories: StoriesEntity[];
}
 interface StoriesEntity {
  id: number;
  userId: number;
  mediaUrl: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  type: "image" | "text"
  background: string
  textColor: string
}


interface CreateStoryResponse {
  statusCode: number;
  data: StoryEntity;
  message: string;
  success: boolean;
}
