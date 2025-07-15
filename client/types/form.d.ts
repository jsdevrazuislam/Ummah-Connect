interface ReactPayload{
    react_type:string, 
    icon:string,
    id:number
    postId?: number
    message?:string
}

interface SharePayload{
    postId: number
    message?:string
    visibility?:string
}

interface CommentPayload{
    content: string
    postId: number
    type?:string
}
interface EditCommentPayload{
    content: string
    commentId: number
    postId: number
    isReply?:boolean
}

interface DeletePostCommentPayload{
    commentId: number,
    parentId: number
}

interface SendMessagePayload{
    conversationId:number,
    content:string
    type:string
    id:number
}
interface ReplyCommentPayload{
    content:string, 
    postId:number,
    id:number
}