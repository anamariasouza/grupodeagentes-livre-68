
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, ArrowLeft, Users, AtSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { groupService } from '@/services/groupService';
import { Group, GroupMessage } from '@/types/groups';
import { Agent, defaultAgents } from '@/types/agents';
import { UserProfile } from '@/types/user';
import { useUserStorage } from '@/hooks/useUserStorage';
import { EmojiPicker } from '@/components/EmojiPicker';
import { AgentAvatar } from '@/components/AgentAvatar';
import { checkUserLimits, DEFAULT_USER_LIMITS, AgentInteractionCount } from '@/types/userLimits';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';

interface GroupChatProps {
  group: Group;
  onBack: () => void;
  userProfile: UserProfile;
}

export const GroupChat: React.FC<GroupChatProps> = ({ group, onBack, userProfile }) => {
  const [messages, setMessages] = useUserStorage<GroupMessage[]>(`group-chat-${group.id}`, []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [agentInteractions, setAgentInteractions] = useUserStorage<AgentInteractionCount[]>('group-agent-interactions', []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agents] = useUserStorage<Agent[]>('agents', defaultAgents);
  
  const groupAgents = agents.filter(agent => group.members.includes(agent.id));
  const IconComponent = Icons[group.icon as keyof typeof Icons] as React.ComponentType<any>;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ref para controlar quando deve fazer scroll automático
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    // Só faz scroll automático se foi solicitado
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
      shouldAutoScrollRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas do grupo
    if (messages.length === 0) {
      const welcomeMessage: GroupMessage = {
        id: Date.now().toString(),
        content: `Olá **${userProfile.name}**! 👋 Bem-vindo ao grupo **${group.name}**! 
        
Aqui você pode conversar com nossa equipe de especialistas: ${groupAgents.map(a => a.name).join(', ')}.

💡 **Dicas para usar o grupo:**
- Faça perguntas específicas sobre qualquer especialidade
- Use @nome para mencionar um especialista específico
- Os especialistas colaboram entre si para dar as melhores respostas

Como podemos te ajudar hoje?`,
        sender: 'agent',
        senderName: 'Sistema',
        timestamp: new Date(),
        groupId: group.id
      };
      setMessages([welcomeMessage]);
    }
  }, [group.id, messages.length, groupAgents, userProfile.name]);

  // Função para atualizar interação do agente
  const updateAgentInteraction = (agentId: string, timestamp: Date) => {
    setAgentInteractions(prev => {
      const existing = prev.find(i => i.agentId === agentId);
      if (existing) {
        return prev.map(i => 
          i.agentId === agentId 
            ? { ...i, lastInteraction: timestamp }
            : i
        );
      } else {
        return [...prev, {
          agentId,
          selfMessagesToday: 0,
          randomQuestionsSent: 0,
          lastInteraction: timestamp,
          lastRandomQuestion: new Date(0),
          lastSelfMessage: new Date(0)
        }];
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Valida o comprimento da mensagem
    const validation = checkUserLimits.validateMessageLength(inputMessage);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    // Atualiza interação dos agentes mencionados
    const mentions = groupService.extractMentions(inputMessage, groupAgents);
    mentions.forEach(agentId => updateAgentInteraction(agentId, new Date()));

    const userMessage: GroupMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      senderName: userProfile.name,
      senderAvatar: userProfile.avatar,
      timestamp: new Date(),
      groupId: group.id
    };

    if (mentions.length > 0) {
      userMessage.mentions = mentions;
    }

    const messagesWithUser = [...messages, userMessage];
    
    // Gerencia histórico limitado
    const managedMessages = checkUserLimits.manageChatHistory(messagesWithUser);
    
    // Solicita scroll automático ao enviar mensagem
    shouldAutoScrollRef.current = true;
    setMessages(managedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Adiciona data/hora atual ao contexto
      const currentDateTime = checkUserLimits.getCurrentDateTime();
      const contextualInput = `[Data/Hora atual: ${currentDateTime}] ${inputMessage}`;

      const { responses } = await groupService.getGroupResponse(
        contextualInput,
        managedMessages,
        group,
        agents,
        mentions,
        userProfile
      );

      const agentMessages: GroupMessage[] = [];
      
      responses.forEach((response, index) => {
        const agent = agents.find(a => a.id === response.agentId);
        
        // Divide a resposta do agente se necessário
        const responseParts = checkUserLimits.splitLongAgentMessage(response.content);
        
        responseParts.forEach((part, partIndex) => {
          agentMessages.push({
            id: (Date.now() + index + partIndex + 1).toString(),
            content: part,
            sender: 'agent' as const,
            senderName: agent?.name || 'Agente',
            senderAvatar: agent?.avatar,
            agentId: response.agentId,
            timestamp: new Date(),
            groupId: group.id
          });
        });
      });

      const finalMessages = [...managedMessages, ...agentMessages];
      
      // Gerencia histórico novamente após adicionar respostas
      const finalManagedMessages = checkUserLimits.manageChatHistory(finalMessages);
      
      // Solicita scroll automático ao receber resposta
      shouldAutoScrollRef.current = true;
      setMessages(finalManagedMessages);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: GroupMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, houve um problema técnico. Vamos tentar novamente?',
        sender: 'agent',
        senderName: 'Sistema',
        timestamp: new Date(),
        groupId: group.id
      };
      const errorMessages = [...managedMessages, errorMessage];
      setMessages(checkUserLimits.manageChatHistory(errorMessages));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
  };

  const handleMentionClick = (agentName: string) => {
    setInputMessage(prev => prev + `@${agentName} `);
  };

  const handleClearChat = () => {
    if (window.confirm('Tem certeza que deseja apagar toda a conversa do grupo? Esta ação não pode ser desfeita.')) {
      setMessages([]);
      // Reinicia a conversa com mensagem de boas-vindas do grupo
      const welcomeMessage: GroupMessage = {
        id: Date.now().toString(),
        content: `🎉 Bem-vindos ao grupo ${group.name}! Aqui você pode conversar com nossos especialistas: ${groupAgents.map(a => a.name).join(', ')}. O que gostariam de discutir hoje?`,
        sender: 'agent',
        senderName: 'Sistema',
        timestamp: new Date(),
        groupId: group.id
      };
      setMessages([welcomeMessage]);
      toast.success('Conversa do grupo apagada com sucesso!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${group.color} text-white p-4 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className={`w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold font-montserrat">{group.name}</h2>
              <p className="text-white/90 text-sm">{groupAgents.length} especialistas online</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-white hover:bg-white/20 p-2"
              title="Apagar conversa do grupo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Users className="h-4 w-4" />
            <span className="text-sm">{groupAgents.length}</span>
          </div>
        </div>
      </div>

      {/* Group Members */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Membros do Grupo</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {groupAgents.map((agent) => (
            <Badge 
              key={agent.id} 
              variant="outline" 
              className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100"
              onClick={() => handleMentionClick(agent.name)}
            >
              <AgentAvatar agent={agent} size="sm" />
              <span>{agent.name}</span>
              <AtSign className="h-3 w-3 text-gray-400" />
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              {message.senderName && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="text-xs">
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`text-xs font-medium ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-blue-600'
                  }`}>
                    {message.senderName}
                  </span>
                </div>
              )}
              <p className="text-base whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md max-w-lg lg:max-w-2xl px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-xs font-medium text-gray-500">Especialistas digitando...</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        <div className="flex space-x-2 items-end">
          <div className="relative flex-1">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Digite sua mensagem... (máx: ${DEFAULT_USER_LIMITS.maxMessageLength} caracteres)`}
              className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm pr-16"
              rows={1}
              maxLength={DEFAULT_USER_LIMITS.maxMessageLength}
            />
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {inputMessage.length}/{DEFAULT_USER_LIMITS.maxMessageLength}
            </div>
          </div>
          <div className="flex space-x-1">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className="px-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="px-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
