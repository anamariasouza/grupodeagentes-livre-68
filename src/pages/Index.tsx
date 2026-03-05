
import React, { useState } from 'react';
import { LogOut, MessageCircle, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactList } from '@/components/ContactList';
import { ChatRoom } from '@/components/ChatRoom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState<{ contactId: string; contactName: string } | null>(null);

  const handleStartChat = (contactId: string, contactName: string) => {
    setActiveChat({ contactId, contactName });
  };

  const handleBackToContacts = () => {
    setActiveChat(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" alt="Chathy" className="w-8 h-8 rounded-full" />
            <h1 className="text-lg font-bold text-foreground">Chathy</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.user_metadata?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - WhatsApp/MSN Style */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Contact List (hidden on mobile when chat is open) */}
        <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-border flex-col bg-card`}>
          <ContactList onStartChat={handleStartChat} />
        </div>

        {/* Chat Area */}
        <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {activeChat ? (
            <ChatRoom
              contactId={activeChat.contactId}
              contactName={activeChat.contactName}
              onBack={handleBackToContacts}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 text-center p-8">
              <img src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" alt="Chathy" className="w-24 h-24 rounded-full opacity-50 mb-6" />
              <h2 className="text-2xl font-bold text-foreground/60 mb-2">Chathy Messenger</h2>
              <p className="text-muted-foreground max-w-md">
                Selecione um contato para iniciar uma conversa ou adicione novos amigos pelo email! 📧
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
