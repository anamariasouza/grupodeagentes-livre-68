
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_profile?: {
    name: string;
    avatar_url: string | null;
  };
}

interface ChatRoomProps {
  contactId: string;
  contactName: string;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ contactId, contactName, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [contactProfile, setContactProfile] = useState<{ avatar_url: string | null; status: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && contactId) {
      initializeConversation();
      loadContactProfile();
    }
  }, [user, contactId]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const newMsg = payload.new as any;
        // Load sender profile
        const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', newMsg.sender_id).single();
        const messageWithProfile: Message = {
          ...newMsg,
          sender_profile: profile || { name: 'Usuário', avatar_url: null }
        };
        setMessages(prev => [...prev, messageWithProfile]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const loadContactProfile = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url, status').eq('id', contactId).single();
    if (data) setContactProfile(data);
  };

  const initializeConversation = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Find existing conversation between these two users
      const { data: myConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      const { data: theirConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', contactId);

      const myIds = new Set((myConversations || []).map(c => c.conversation_id));
      const commonId = (theirConversations || []).find(c => myIds.has(c.conversation_id));

      if (commonId) {
        // Check if it's a direct conversation
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', commonId.conversation_id)
          .eq('type', 'direct')
          .single();

        if (conv) {
          setConversationId(conv.id);
          await loadMessages(conv.id);
          return;
        }
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'direct', created_by: user.id })
        .select()
        .single();

      if (convError || !newConv) {
        toast.error('Erro ao criar conversa');
        return;
      }

      // Add both participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: newConv.id, user_id: user.id },
        { conversation_id: newConv.id, user_id: contactId }
      ]);

      setConversationId(newConv.id);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    // Load sender profiles
    const senderIds = [...new Set((data || []).map(m => m.sender_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_url').in('id', senderIds);

    const messagesWithProfiles = (data || []).map(m => ({
      ...m,
      sender_profile: profiles?.find(p => p.id === m.sender_id) || { name: 'Usuário', avatar_url: null }
    }));

    setMessages(messagesWithProfiles);
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !conversationId || !user) return;

    const content = inputMessage.trim();
    setInputMessage('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      type: 'text'
    });

    if (error) {
      toast.error('Erro ao enviar mensagem');
      setInputMessage(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((groups, msg) => {
    const date = new Date(msg.created_at).toDateString();
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={contactProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(contactName)}</AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${contactProfile?.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{contactName}</h3>
          <p className="text-xs text-muted-foreground">{contactProfile?.status === 'online' ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando conversa...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Smile className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma mensagem ainda</p>
            <p className="text-sm text-muted-foreground">Diga olá para {contactName}! 👋</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {formatDateSeparator(group.messages[0].created_at)}
                </span>
              </div>
              {group.messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card text-card-foreground shadow-sm border border-border rounded-bl-md'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="flex-1 resize-none min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            size="sm"
            className="h-10 w-10 p-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
