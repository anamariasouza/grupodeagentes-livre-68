
import React, { useState, useEffect } from 'react';
import { MessageCircle, Settings, Users, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentPortal } from '@/components/AgentPortal';
import { AgentChat } from '@/components/AgentChat';
import { AdminPanel } from '@/components/AdminPanel';
import { GroupPortal } from '@/components/GroupPortal';
import { GroupChat } from '@/components/GroupChat';
import { QuickActionsMenu } from '@/components/QuickActionsMenu';
import { DailyDisclaimerDialog } from '@/components/DailyDisclaimerDialog';
import { GroupCreator } from '@/components/GroupCreator';
import { Agent, defaultAgents } from '@/types/agents';
import { Group, defaultGroups } from '@/types/groups';
import { UserProfile, defaultUserProfile } from '@/types/user';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'portal' | 'chat' | 'config' | 'groups' | 'group-chat' | 'create-agent' | 'create-group'>('portal');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showDailyDisclaimer, setShowDailyDisclaimer] = useState(false);
  const [agents] = useLocalStorage<Agent[]>('agents', defaultAgents);
  const [groups] = useLocalStorage<Group[]>('groups', defaultGroups);
  const [userProfile] = useLocalStorage<UserProfile>('user-profile', defaultUserProfile);
  const { user, logout } = useAuth();

  // Verifica se deve mostrar o aviso diário
  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('daily-disclaimer-shown');
    
    if (lastShown !== today) {
      setShowDailyDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    const today = new Date().toDateString();
    localStorage.setItem('daily-disclaimer-shown', today);
    setShowDailyDisclaimer(false);
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTab('chat');
  };

  const handleBackToPortal = () => {
    setSelectedAgent(null);
    setActiveTab('portal');
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setActiveTab('group-chat');
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setActiveTab('groups');
  };

  const handleCreateAgent = () => {
    setActiveTab('config');
  };

  const handleCreateGroup = () => {
    setActiveTab('create-group');
  };

  const handleViewChats = () => {
    setActiveTab('portal');
  };

  const handleAgentCreated = () => {
    setActiveTab('portal');
  };

  const handleGroupCreated = () => {
    setActiveTab('groups');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'portal':
        return <AgentPortal onAgentSelect={handleAgentSelect} onCreateAgent={handleCreateAgent} />;
      case 'chat':
        if (selectedAgent) {
          const currentAgent = agents.find(a => a.id === selectedAgent.id) || selectedAgent;
          return <AgentChat agent={currentAgent} onBack={handleBackToPortal} userProfile={userProfile} />;
        } else {
          return <AgentPortal onAgentSelect={handleAgentSelect} onCreateAgent={handleCreateAgent} />;
        }
      case 'groups':
        return <GroupPortal onGroupSelect={handleGroupSelect} />;
      case 'group-chat':
        if (selectedGroup) {
          const currentGroup = groups.find(g => g.id === selectedGroup.id) || selectedGroup;
          return <GroupChat group={currentGroup} onBack={handleBackToGroups} userProfile={userProfile} />;
        } else {
          return <GroupPortal onGroupSelect={handleGroupSelect} />;
        }
      case 'create-agent':
        return <AgentPortal onAgentSelect={handleAgentSelect} onCreateAgent={handleCreateAgent} />;
      case 'create-group':
        return <GroupCreator agents={agents} onCreateGroup={handleGroupCreated} onCancel={() => setActiveTab('groups')} />;
      case 'config':
        return <AdminPanel />;
      default:
        return <AgentPortal onAgentSelect={handleAgentSelect} onCreateAgent={handleCreateAgent} />;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Removido sistema de imagens randômicas - usando apenas padrão rapport */}
      <header className="bg-white/90 backdrop-blur shadow-sm border-b border-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => setActiveTab('portal')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" 
                  alt="Chathy Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-montserrat">Chathy</h1>
              </div>
            </button>
            
            {/* Navigation */}
            <div className="flex items-center space-x-1">
              <Button
                variant={activeTab === 'portal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('portal')}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Agentes</span>
              </Button>
              
              <Button
                variant={activeTab === 'groups' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('groups')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Grupos</span>
              </Button>
              
              {selectedAgent && (
                <Button
                  variant={activeTab === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              )}

              {selectedGroup && (
                <Button
                  variant={activeTab === 'group-chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('group-chat')}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Grupo</span>
                </Button>
              )}
              
              <Button
                variant={activeTab === 'config' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('config')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>

              {/* User info and logout */}
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.name || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Action Button */}
      {(activeTab === 'portal' || activeTab === 'groups') && (
        <Button
          onClick={() => setShowQuickActions(true)}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Quick Actions Menu */}
      <QuickActionsMenu
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onCreateAgent={handleCreateAgent}
        onCreateGroup={handleCreateGroup}
        onViewChats={handleViewChats}
      />

      {/* Daily Disclaimer Dialog */}
      <DailyDisclaimerDialog
        isOpen={showDailyDisclaimer}
        onClose={handleCloseDisclaimer}
      />

      {/* Main Content */}
      <main className={`${activeTab === 'chat' || activeTab === 'group-chat' ? 'h-[calc(100vh-5rem)]' : ''} ${activeTab === 'config' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} relative z-10`}>
        <div className={`${activeTab === 'chat' || activeTab === 'group-chat' ? 'h-full' : activeTab === 'config' ? 'min-h-[calc(100vh-5rem)]' : 'h-[calc(100vh-12rem)]'}`}>
          {renderContent()}
        </div>
      </main>

    </div>
  );
};

export default Index;
