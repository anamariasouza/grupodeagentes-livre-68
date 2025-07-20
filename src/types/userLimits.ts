export interface UserLimits {
  maxAgents: number;
  maxMessageLength: number;
  maxAgentMessageLength: number;
  maxChatHistoryLength: number;
  maxAgentSelfMessages: number;
  maxAgentRandomQuestions: number;
  agentInactivityThreshold: number; // em horas
}

export const DEFAULT_USER_LIMITS: UserLimits = {
  maxAgents: 3,
  maxMessageLength: 800,
  maxAgentMessageLength: 800,
  maxChatHistoryLength: 100,
  maxAgentSelfMessages: 3,
  maxAgentRandomQuestions: 3,
  agentInactivityThreshold: 1
};

export interface AgentInteractionCount {
  agentId: string;
  selfMessagesToday: number;
  randomQuestionsSent: number;
  lastInteraction: Date;
  lastRandomQuestion: Date;
  lastSelfMessage: Date;
}

export const checkUserLimits = {
  canCreateAgent: (currentAgentCount: number, limits: UserLimits = DEFAULT_USER_LIMITS): boolean => {
    return currentAgentCount < limits.maxAgents;
  },

  validateMessageLength: (message: string, limits: UserLimits = DEFAULT_USER_LIMITS): { valid: boolean; message?: string } => {
    if (message.length > limits.maxMessageLength) {
      return {
        valid: false,
        message: `Mensagem muito longa. Máximo permitido: ${limits.maxMessageLength} caracteres.`
      };
    }
    return { valid: true };
  },

  splitLongAgentMessage: (message: string, limits: UserLimits = DEFAULT_USER_LIMITS): string[] => {
    if (message.length <= limits.maxAgentMessageLength) {
      return [message];
    }

    const maxPartLength = Math.floor(limits.maxAgentMessageLength / 2);
    const parts: string[] = [];
    let currentMessage = message;

    while (currentMessage.length > 0) {
      if (currentMessage.length <= maxPartLength) {
        parts.push(currentMessage);
        break;
      }

      // Procura o último espaço antes do limite
      let splitIndex = maxPartLength;
      while (splitIndex > 0 && currentMessage[splitIndex] !== ' ') {
        splitIndex--;
      }

      if (splitIndex === 0) {
        splitIndex = maxPartLength;
      }

      parts.push(currentMessage.substring(0, splitIndex).trim());
      currentMessage = currentMessage.substring(splitIndex).trim();

      if (parts.length >= 2) break; // Máximo 2 partes
    }

    return parts;
  },

  manageChatHistory: <T extends { id: string; timestamp: Date }>(
    messages: T[], 
    limits: UserLimits = DEFAULT_USER_LIMITS
  ): T[] => {
    if (messages.length <= limits.maxChatHistoryLength) {
      return messages;
    }

    // Mantém as últimas mensagens dentro do limite
    return messages.slice(-limits.maxChatHistoryLength);
  },

  canAgentSendSelfMessage: (
    agentId: string, 
    interactions: AgentInteractionCount[], 
    limits: UserLimits = DEFAULT_USER_LIMITS
  ): boolean => {
    const agentInteraction = interactions.find(i => i.agentId === agentId);
    if (!agentInteraction) return true;

    const today = new Date();
    const lastMessageDate = new Date(agentInteraction.lastSelfMessage);
    
    // Reset contador se for um novo dia
    if (today.toDateString() !== lastMessageDate.toDateString()) {
      return true;
    }

    return agentInteraction.selfMessagesToday < limits.maxAgentSelfMessages;
  },

  canAgentSendRandomQuestion: (
    agentId: string, 
    interactions: AgentInteractionCount[], 
    limits: UserLimits = DEFAULT_USER_LIMITS
  ): boolean => {
    const agentInteraction = interactions.find(i => i.agentId === agentId);
    if (!agentInteraction) return true;

    const now = new Date();
    const lastInteraction = new Date(agentInteraction.lastInteraction);
    const lastRandomQuestion = new Date(agentInteraction.lastRandomQuestion);
    
    // Verifica se passou o tempo de inatividade
    const hoursSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastInteraction < limits.agentInactivityThreshold) {
      return false;
    }

    // Reset contador se for um novo dia
    const today = new Date();
    if (today.toDateString() !== lastRandomQuestion.toDateString()) {
      return true;
    }

    return agentInteraction.randomQuestionsSent < limits.maxAgentRandomQuestions;
  },

  getCurrentDateTime: (): string => {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
};