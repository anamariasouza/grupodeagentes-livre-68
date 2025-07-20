
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { mistralService, MistralMessage } from '@/services/mistralService';
import { PsychologistAvatar } from './PsychologistAvatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PsychologistProfile } from '@/types';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'psychologist';
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useLocalStorage<Message[]>('chat-history', []);
  const [profile] = useLocalStorage<PsychologistProfile>('psychologist-profile', {
    name: 'Dr. Virtual',
    specialty: 'Psicologia Clínica',
    experience: '10 anos de experiência',
    approach: 'Terapia Cognitivo-Comportamental',
    bio: 'Especialista em ansiedade, depressão e relacionamentos.',
    guidelines: `Diretrizes para atendimento:
1. Sempre iniciar com perguntas abertas sobre o estado emocional
2. Praticar escuta ativa e validação emocional
3. Usar técnicas de TCC quando apropriado
4. Manter confidencialidade absoluta
5. Encaminhar para profissionais presenciais quando necessário
6. Oferecer recursos e exercícios práticos`,
    personaStyle: 'Empático, acolhedor e profissional',
    documentation: 'Base de conhecimento do psicólogo virtual'
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'happy' | 'thinking' | 'concerned' | 'encouraging'>('happy');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Inicia a conversa se não houver mensagens
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Olá! 😊 Sou ${profile.name}, seu psicólogo virtual. Estou aqui para te ouvir e te ajudar. Como você está se sentindo hoje? Gostaria de me contar o que trouxe você até aqui?`,
        sender: 'psychologist',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [profile.name]); // Adiciona profile.name como dependência

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setCurrentEmotion('thinking');

    try {
      const conversationHistory: MistralMessage[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Passa o perfil para o mistralService
      const response = await mistralService.getPsychologistResponse(inputMessage, conversationHistory, profile);
      
      const psychologistMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'psychologist',
        timestamp: new Date()
      };

      setMessages((prev: Message[]) => [...prev, psychologistMessage]);
      setCurrentEmotion('encouraging');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, houve um problema técnico. Vamos tentar novamente?',
        sender: 'psychologist',
        timestamp: new Date()
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
      setCurrentEmotion('concerned');
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
    // Aqui você implementaria a funcionalidade de gravação de voz
    // Por enquanto, apenas simula o estado
  };

  const handleClearChat = () => {
    if (window.confirm('Tem certeza que deseja apagar toda a conversa? Esta ação não pode ser desfeita.')) {
      setMessages([]);
      // Reinicia a conversa com mensagem de boas-vindas
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Olá! 😊 Sou ${profile.name}, seu psicólogo virtual. Estou aqui para te ouvir e te ajudar. Como você está se sentindo hoje? Gostaria de me contar o que trouxe você até aqui?`,
        sender: 'psychologist',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      toast.success('Conversa apagada com sucesso!');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header com Avatar */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <PsychologistAvatar emotion={currentEmotion} />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-teal-100">{profile.specialty} • Sempre disponível</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-white hover:bg-white/20 p-2"
            title="Apagar conversa"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              <p className="text-sm">{message.content}</p>
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
            <div className="bg-white text-gray-800 shadow-md max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
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

      {/* Área de Input */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 resize-none"
            rows={2}
          />
          <div className="flex flex-col space-y-2">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className="px-3"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-3"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
