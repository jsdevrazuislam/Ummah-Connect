import { getFileType } from "@/lib/utils";

export function loadTempDataForMessage({
  user,
  selectedConversation,
  message,
  status,
  id,
  attachments: inputAttachments,
  keyForRecipient,
  keyForSender,
}: {
  selectedConversation: MessageSender | null;
  message: string;
  user: User | null;
  status: string;
  id: number;
  keyForRecipient: string;
  keyForSender: string;
  attachments?: (Blob | File)[];
}) {
  const now = new Date().toISOString();

  const processedAttachments = inputAttachments
    ? inputAttachments.map((file, index) => {
        const fileUrl = URL.createObjectURL(file);

        const fileType = getFileType(file.type || "");

        const duration = 0;

        return {
          id: id + index,
          messageId: id,
          fileUrl,
          fileType,
          duration,
          thumbnailUrl: "",
          sizeInBytes: file.size,
          metadata: {},
          createdAt: now,
          updatedAt: now,
        };
      })
    : [];

  return {
    id,
    conversationId: selectedConversation?.conversationId ?? 0,
    senderId: user?.id ?? 0,
    content: message ?? "Attachment",
    keyForRecipient,
    keyForSender,
    parentMessageId: null,
    sentAt: now,
    isDeleted: null,
    deletedById: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    status,
    sender: {
      id: user?.id ?? 0,
      fullName: user?.fullName ?? "",
      avatar: user?.avatar ?? "",
      username: user?.username ?? "",
    },
    reactions: [],
    statuses: [],
    attachments: processedAttachments,
  };
}

export function loadTempDataForStreamChat(user: User | null, content: string, streamId: number, id: number) {
  return {
    id,
    streamId,
    senderId: user?.id ?? 0,
    content,
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
    sender: {
      id: user?.id ?? 0,
      username: user?.username ?? "",
      fullName: user?.fullName ?? "",
      avatar: user?.avatar ?? "",
    },
    status: "sending",
  };
}
