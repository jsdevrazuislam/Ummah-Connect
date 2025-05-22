interface ReactPayload{
    react_type:string, icon:string,id:number
}

interface CommentPayload{
    content: string
    postId: number
}
interface EditCommentPayload{
    content: string
    commentId: number
    postId: number
    isReply?:boolean
}



interface ReplyCommentPayload{
    content:string, 
    postId:number,
    id:number
}