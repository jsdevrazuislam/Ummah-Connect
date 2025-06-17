 interface LiveStreamResponse {
  statusCode: number;
  data?: (LiveStreamData)[] | null;
  message: string;
  success: boolean;
}
 interface LiveStreamChatsResponse {
  statusCode: number;
  data?: {
    messages: LiveStreamChatData[]
    totalPages: number
    currentPage: number
  };
  message: string;
  success: boolean;
}

 interface LiveStreamChatData {
  id: number;
  stream_id: number;
  sender_id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
}
 interface Sender {
  id: number;
  username: string;
  full_name: string;
  avatar: string;
}


interface StartLiveStreamResponse{
  statusCode: number;
  data?: {
    stream: LiveStreamData
  };
  message: string;
  success: boolean;
}

 interface LiveStreamDetailsResponse {
  statusCode: number;
  data?: {
    stream: LiveStreamData
    token: string
    livekitUrl:string
  } | null;
  message: string;
  success: boolean;
}
 interface LiveStreamData {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  tags?: (string)[] | null;
  enable_chat: boolean;
  save_recording: boolean;
  notify_followers: boolean;
  room_name: string;
  is_active: boolean;
  started_at: string;
  ended_at?: null;
  createdAt: string;
  thumbnail?:string,
  viewers?:number
  user:{
    avatar: string,
    username:string,
    full_name:string
    id:number
    isFollowing: boolean
  followerCount: string

  }
  updatedAt: string;
}
