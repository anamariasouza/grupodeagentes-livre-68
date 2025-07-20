import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AgentMemory, ConversationEntry, VirtualRoom } from '@/types/memory';
import { ChatMessage } from '@/types/agents';

export const useAgentMemory = (agentId: string) => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<AgentMemory | null>(null);
  const [virtualRoom, setVirtualRoom] = useState<VirtualRoom | null>(null);

  const getMemoryKey = () => `${user?.id}-agent-memory-${agentId}`;
  const getRoomKey = () => `${user?.id}-virtual-room-${agentId}`;

  useEffect(() => {
    if (!user || !agentId) return;

    // Carregar memória do agente
    const memoryKey = getMemoryKey();
    const savedMemory = localStorage.getItem(memoryKey);
    
    if (savedMemory) {
      const parsedMemory: AgentMemory = JSON.parse(savedMemory);
      // Converter dates
      parsedMemory.lastInteraction = new Date(parsedMemory.lastInteraction);
      parsedMemory.createdAt = new Date(parsedMemory.createdAt);
      parsedMemory.conversationHistory = parsedMemory.conversationHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setMemory(parsedMemory);
    } else {
      // Criar nova memória
      const newMemory: AgentMemory = {
        agentId,
        userId: user.id,
        conversationHistory: [],
        personalNotes: '',
        preferences: {},
        lastInteraction: new Date(),
        createdAt: new Date()
      };
      setMemory(newMemory);
      localStorage.setItem(memoryKey, JSON.stringify(newMemory));
    }

    // Carregar sala virtual
    const roomKey = getRoomKey();
    const savedRoom = localStorage.getItem(roomKey);
    
    if (savedRoom) {
      const parsedRoom: VirtualRoom = JSON.parse(savedRoom);
      parsedRoom.lastActivity = new Date(parsedRoom.lastActivity);
      setVirtualRoom(parsedRoom);
    } else {
      // Criar nova sala virtual
      const newRoom: VirtualRoom = {
        id: `room-${agentId}-${Date.now()}`,
        agentId,
        roomName: `Sala Virtual - ${agentId}`,
        environment: `Uma sala confortável e privada onde apenas ${agentId} e o usuário podem conversar. Este é um espaço seguro para memórias e conversas íntimas.`,
        memories: memory || {} as AgentMemory,
        lastActivity: new Date()
      };
      setVirtualRoom(newRoom);
      localStorage.setItem(roomKey, JSON.stringify(newRoom));
    }
  }, [user, agentId]);

  const addConversationEntry = (message: ChatMessage, context?: string) => {
    if (!memory || !user) return;

    const entry: ConversationEntry = {
      id: message.id,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp,
      context,
      emotions: [],
      importance: 'medium'
    };

    const updatedMemory: AgentMemory = {
      ...memory,
      conversationHistory: [...memory.conversationHistory, entry],
      lastInteraction: new Date()
    };

    setMemory(updatedMemory);
    localStorage.setItem(getMemoryKey(), JSON.stringify(updatedMemory));

    // Atualizar sala virtual
    if (virtualRoom) {
      const updatedRoom: VirtualRoom = {
        ...virtualRoom,
        memories: updatedMemory,
        lastActivity: new Date()
      };
      setVirtualRoom(updatedRoom);
      localStorage.setItem(getRoomKey(), JSON.stringify(updatedRoom));
    }
  };

  const updatePersonalNotes = (notes: string) => {
    if (!memory) return;

    const updatedMemory: AgentMemory = {
      ...memory,
      personalNotes: notes,
      lastInteraction: new Date()
    };

    setMemory(updatedMemory);
    localStorage.setItem(getMemoryKey(), JSON.stringify(updatedMemory));
  };

  const getRecentConversations = (limit: number = 10): ConversationEntry[] => {
    if (!memory) return [];
    
    return memory.conversationHistory
      .slice(-limit)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getContextForAgent = (): string => {
    if (!memory || !virtualRoom) return '';

    const recentConversations = getRecentConversations(5);
    const contextInfo = recentConversations.length > 0 
      ? `Conversas recentes: ${recentConversations.map(c => `${c.sender}: ${c.content.substring(0, 100)}`).join('; ')}`
      : 'Primeira conversa com este usuário';

    return `
CONTEXTO DA SALA VIRTUAL:
- Ambiente: ${virtualRoom.environment}
- Última atividade: ${virtualRoom.lastActivity.toLocaleString()}

MEMÓRIA PESSOAL:
- Notas pessoais: ${memory.personalNotes || 'Nenhuma nota pessoal'}
- Total de conversas: ${memory.conversationHistory.length}
- ${contextInfo}

Você está em sua sala virtual privada. Use essas informações para manter continuidade e personalização nas conversas.
    `;
  };

  return {
    memory,
    virtualRoom,
    addConversationEntry,
    updatePersonalNotes,
    getRecentConversations,
    getContextForAgent
  };
};