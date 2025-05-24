interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  username: string;
}

interface UpdatedCommentPayload{
    content: string;
    id: number;
    isEdited: boolean;
    postId: number;
    parentId: number;
    user: {
        id: number;
        full_name: string;
        avatar: string;
        username: string;
    };
    isReply: boolean;
}

interface PostReactPayload{
    postData: {
        reactions: Reactions
    },
    postId: number
}

interface CreateCommentPayload{
  data: CommentPreview
}
interface CreateCommentReplyPayload{
  data: RepliesEntity
}

interface CommentReactPayload{
  postId:number
  commentId:number
  parentId:number
  isReply:boolean
  data:{
    reactions: Reactions
  }
}

interface DeleteCommentPayload{
    id: number,
    userId: number,
    postId: number,
    isEdited: boolean,
    parentId: number,
    content: string,
    createdAt: string,
    updatedAt: string
    isReply: boolean
}