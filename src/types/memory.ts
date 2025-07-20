export interface AgentMemory {
  agentId: string;
  userId: string;
  conversationHistory: ConversationEntry[];
  personalNotes: string;
  preferences: Record<string, any>;
  lastInteraction: Date;
  createdAt: Date;
}

export interface ConversationEntry {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  context?: string;
  emotions?: string[];
  importance: 'low' | 'medium' | 'high';
}

export interface VirtualRoom {
  id: string;
  agentId: string;
  roomName: string;
  environment: string;
  memories: AgentMemory;
  lastActivity: Date;
}