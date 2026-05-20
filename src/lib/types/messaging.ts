export interface ConversationSummary {
  id: string;
  type: "support" | "agent";
  agentId: string | null;
  agentName: string | null;
  agentCity: string | null;
  agentAvatarUrl: string | null;
  title: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string; // ISO
  unreadByUser: number;
}

export interface ConversationDetail extends ConversationSummary {
  archivedAt: string | null;
  sourcingRequestId: string | null;
}

export interface ProductContext {
  productSlug: string;
  productTitle: string;
  productPitch: string;
  productImage: string | null;
  moq: number;
  leadTimeDays: number;
  fromPrice: number | null;
  requestType: "quote" | "sample";
  quantity: number | null;
  requestStatus: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderType: "user" | "agent" | "support" | "system";
  senderId: string | null;
  content: string;
  attachments: string | null; // JSON string of URL array
  translatedContent: string | null;
  readByUserAt: string | null;
  readByCounterpartAt: string | null;
  createdAt: string;
}
