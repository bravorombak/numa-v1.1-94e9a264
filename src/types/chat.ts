export type ChatAttachmentType = "image" | "file";

export interface ChatAttachment {
  type: ChatAttachmentType;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}
