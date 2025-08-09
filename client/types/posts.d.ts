type PostsResponse = {
  statusCode: number;
  data?: PostsData;
  message: string;
  success: boolean;
};
type SharePostResponse = {
  statusCode: number;
  data?: {
    share: PostsEntity;
    sharedPostId: number;
    postData: PostsEntity;
  };
  message: string;
  success: boolean;
};
type BookmarkPostsResponse = {
  statusCode: number;
  data?: BookmarkPostsData;
  message: string;
  success: boolean;
};

type BookmarkPostsData = {
  posts?: BookmarkPostEntity[];
  totalPages: number;
  currentPage: number;
  user?: User;
};

type BookmarkPostEntity = {
  createdAt: string;
  updatedAt: string;
  id: number;
  userId: number;
  postId: number;
  post: PostsEntity;
};
type PostsData = {
  posts?: PostsEntity[];
  totalPages: number;
  currentPage: number;
  user?: User;
};
type PostsEntity = {
  id: number;
  authorId: number;
  user: PostAuthor;
  content: string;
  timestamp: string;
  createdAt?: string;
  originalPost: PostsEntity | null;
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
  createdAt: string;
  contentType?: "text" | "video" | "audio" | "picture";
};
type PostAuthor = {
  id: number;
  fullName: string;
  username: string;
  avatar?: string;
  location?: string;
  followingCount?: string | number;
  followersCount?: string | number;
  bio: string;
  isFollowing?: boolean;
  privacySettings?: PrivacySettings;
  publicKey?: string;
};

type CommentsResponse = {
  statusCode: number;
  data: {
    comments: CommentPreview[] | null;
    totalPages: number;
    currentPage: number;
  };
  message: string;
  success: boolean;
};
type CommentPreview = {
  id: number;
  userId: number;
  content: string;
  user: PostAuthor;
  replies?: RepliesEntity[];
  repliesCount: number;
  createdAt: string;
  isEdited: boolean;
  parentId: number;
  postId?: number;
  shortId?: number;
  totalComments?: number;
  totalReactionsCount?: number;
  currentUserReaction: ReactionType;

};

type ReactionType
  = | "like"
    | "love"
    | "haha"
    | "care"
    | "sad"
    | "wow"
    | "angry"
    | null;

type RepliesEntity = {
  userId: number;
  id: number;
  parentId: number;
  postId?: number;
  shortId?: number;
  content: string;
  user: PostAuthor;
  repliesCount: number;
  createdAt: string;
  isEdited: boolean;
  totalComments?: number;
  totalReactionsCount?: number;
  currentUserReaction: ReactionType;
};
type Counts = {
  love: number;
};

type SuggestionUsers = {
  statusCode: number;
  data?: (SuggestionEntity)[] | null;
  message: string;
  success: boolean;
};
type SuggestionEntity = {
  id: number;
  username: string;
  avatar?: null;
  fullName: string;
  followerCount: string;
  isFollowing: boolean;
};

type StoryResponse = {
  statusCode: number;
  data?: (DataEntity)[] | null;
  message: string;
  success: boolean;
};
type StoryEntity = {
  id: number;
  username: string;
  avatar?: null;
  fullName: string;
  stories: StoriesEntity[];
};
type StoriesEntity = {
  id: number;
  userId: number;
  mediaUrl: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  type: "image" | "text";
  background: string;
  textColor: string;
};

type CreateStoryResponse = {
  statusCode: number;
  data: StoryEntity;
  message: string;
  success: boolean;
};

type LocationResponse = {
  type: string;
  query?: (number)[] | null;
  features: FeaturesEntity[];
  attribution: string;
};
type FeaturesEntity = {
  id: string;
  type: string;
  place_type?: (string)[] | null;
  relevance: number;
  properties: Properties;
  text: string;
  place_name: string;
  bbox?: (number)[] | null;
  center?: (number)[] | null;
  geometry: Geometry;
  context: ContextEntity[];
};
type Properties = {
  mapbox_id: string;
  wikidata: string;
};
type Geometry = {
  type: string;
  coordinates?: (number)[] | null;
};
type ContextEntity = {
  id: string;
  mapbox_id: string;
  wikidata: string;
  text: string;
  short_code?: string | null;
};

type MyPostResponse = {
  statusCode: number;
  data: {
    posts: PostsEntity[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
  success: boolean;
};
