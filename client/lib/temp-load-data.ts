import { getFileType } from "@/lib/utils";

export const loadTempDataForMessage = ({
  user,
  selectedConversation,
  message,
  status,
  id,
  attachments: inputAttachments
}: {
  selectedConversation: MessageSender | null;
  message: string;
  user: User | null;
  status: string;
  id: number;
  attachments?: (Blob | File)[];
}) => {
  const now = new Date().toISOString();

  const processedAttachments = inputAttachments
    ? inputAttachments.map((file, index) => {

      const fileUrl = URL.createObjectURL(file);

      const fileType = getFileType(file.type || '')

      const duration = 0;


      return {
        id: id + index,
        message_id: id,
        file_url: fileUrl,
        file_type: fileType,
        duration: duration,
        thumbnail_url: '',
        size_in_bytes: file.size,
        metadata: {},
        createdAt: now,
        updatedAt: now,
      };
    })
    : [];

  return {
    id,
    conversation_id: selectedConversation?.conversationId ?? 0,
    sender_id: user?.id ?? 0,
    content: message ?? 'Attachment',
    parent_message_id: null,
    sent_at: now,
    is_deleted: null,
    deleted_by_id: null,
    deleted_at: null,
    createdAt: now,
    updatedAt: now,
    status,
    sender: {
      id: user?.id ?? 0,
      full_name: user?.full_name ?? "",
      avatar: user?.avatar ?? "",
      username: user?.username ?? "",
    },
    reactions: [],
    statuses: [],
    attachments: processedAttachments,
  };
};


export const loadTempDataForStreamChat = (user: User | null, content:string, streamId:number, id:number) =>{
   return {
    id,
    stream_id: streamId,
    sender_id: user?.id ?? 0,
    content,
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
    sender: {
      id: user?.id ?? 0,
      username: user?.username ?? '',
      full_name: user?.full_name ?? '',
      avatar: user?.avatar ?? ''
    },
    status: 'sending'
  }
}