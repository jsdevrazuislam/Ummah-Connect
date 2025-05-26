export interface ReactPostType {
  react_type: string;
  userId: number
}

export interface Post {
  id: number;
  media?: null;
  content: string;
  location: string;
  share?: null;
  privacy: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  totalCommentsCount: string;
  totalReactionsCount: string;
  comments?: (CommentsEntity | null)[] | null;
  reactions?: ReactionsEntity[] | null;
  bookmarks?: BookmarksEntity[] | null;
  user: User;
  originalPost: Post
}
export interface CommentsEntity {
  id: number;
  postId: number;
  isEdited?: null;
  parentId?: null;
  content: string;
  createdAt: string;
  replies?: (RepliesEntity)[] | null;
  user: User;
  reactions?: ReactionsEntity[] | null;
}
export interface RepliesEntity {
  id: number;
  postId: number;
  isEdited?: null;
  parentId: number;
  content: string;
  createdAt: string;
  user: User;
  reactions?: ReactionsEntity[] | null;
}
export interface User {
  id: number;
  username: string;
  full_name: string;
  avatar?: null;
  followers_count:string
  following_count:string
  location:string
}
export interface ReactionsEntity {
  userId: number;
  react_type: string;
  icon: string;
  postId:number
  commentId:number
}
export interface BookmarksEntity {
  id: number;
  postId: number;
  userId: number;
}
