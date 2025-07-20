import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Settings, User, MessageSquare, Download, BookOpen, Calendar, Trophy, Plus, Edit, Trash2, UserCog, RotateCcw, Bot } from 'lucide-react';
import { useUserStorage } from '@/hooks/useUserStorage';
import { Message, ConsultationProtocol } from '@/types';
import { Agent, defaultAgents } from '@/types/agents';
import { UserProfile, defaultUserProfile } from '@/types/user';
import { AgentAvatar } from './AgentAvatar';
import { IconPicker } from './IconPicker';
import { AvatarPicker } from './AvatarPicker';
import { CustomImageUpload } from './CustomImageUpload';
import { SpecialtySelector } from './SpecialtySelector';
import { ColorPicker } from './ColorPicker';
import { UserProfileSettings } from './UserProfileSettings';
import { generateAgentContent } from '@/utils/agentContentGenerator';
import { DashboardLayout } from './DashboardLayout';
import { Dashboard } from './Dashboard';
import { ChangePassword } from './ChangePassword';
import { Guidelines } from './Guidelines';

import { Documentation } from './Documentation';
import { SystemSettings } from './SystemSettings';
import { Integrations } from './Integrations';
import { DeleteAccount } from './DeleteAccount';
import { TermsPrivacy } from './TermsPrivacy';
import { AIContentGenerator } from './AIContentGenerator';

export const AdminPanel = () => {
  const [agents, setAgents] = useUserStorage<Agent[]>('agents', defaultAgents);
  const [userProfile, setUserProfile] = useUserStorage<UserProfile>('user-profile', defaultUserProfile);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages] = useUserStorage<Message[]>('chat-history', []);
  const [protocols, setProtocols] = useUserStorage<ConsultationProtocol[]>('consultation-protocols', []);
  type TabType = 'dashboard' | 'profile' | 'change-password' | 'agents' | 'edit-agent' | 'guidelines' | 'persona' | 'docs' | 'history' | 'protocols' | 'settings' | 'integrations' | 'delete' | 'terms' | 'logout';
  const [activeTab, setActiveTab] = useState<TabType>('agents'); // Inicia na aba de agentes

  const handleSaveAgent = () => {
    if (!selectedAgent) return;
    
    const updatedAgents = agents.map(agent => 
      agent.id === selectedAgent.id ? selectedAgent : agent
    );
    setAgents(updatedAgents);
    alert('Agente salvo com sucesso!');
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    alert('Perfil salvo com sucesso!');
  };

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: 'Novo Agente',
      title: 'Especialista',
      specialty: 'Psicologia Clínica',
      description: 'Descrição do novo agente',
      icon: 'User',
      color: 'from-blue-500 to-cyan-500',
      experience: '1 ano de experiência',
      approach: 'Abordagem personalizada',
      guidelines: 'Diretrizes do agente...',
      personaStyle: 'Estilo profissional',
      documentation: 'Documentação do agente',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    };
    
    setAgents([...agents, newAgent]);
    setSelectedAgent(newAgent);
    setActiveTab('edit-agent');
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Tem certeza que deseja deletar este agente?')) {
      const updatedAgents = agents.filter(agent => agent.id !== agentId);
      setAgents(updatedAgents);
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
      }
    }
  };

  const handleDownloadHistory = () => {
    const historyText = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender === 'user' ? 'Usuário' : 'Agente'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetLocalStorage = () => {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá apagar dados específicos do usuário (agentes personalizados, conversas, configurações). Esta ação não pode ser desfeita. Tem certeza que deseja continuar?')) {
      if (confirm('Esta é sua última chance! Confirma que deseja resetar os dados do usuário?')) {
        // Limpar apenas dados específicos do usuário, não tudo
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('agents') ||
            key.includes('chat-history') ||
            key.includes('groups') ||
            key.includes('user-profile') ||
            key.includes('consultation-protocols') ||
            key.includes('agent-interactions')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        alert('Dados do usuário foram apagados. A página será recarregada.');
        window.location.reload();
      }
    }
  };

  const createNewProtocol = () => {
    const newProtocol: ConsultationProtocol = {
      id: Date.now().toString(),
      patientName: '',
      sessionNumber: protocols.length + 1,
      date: new Date(),
      objectives: [''],
      activities: [''],
      progress: 0,
      gamificationScore: 0,
      nextSteps: [''],
      status: 'planning'
    };
    setProtocols([...protocols, newProtocol]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <UserProfileSettings userProfile={userProfile} onSave={handleSaveUserProfile} />;
      case 'change-password':
        return <ChangePassword />;
      case 'guidelines':
        return <Guidelines />;
      case 'persona':
        if (!selectedAgent) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecione um agente para editar a persona</p>
            </div>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Estilo da Persona: {selectedAgent.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Personalidade do Agente
                </label>
                <Textarea
                  value={selectedAgent.personaStyle}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, personaStyle: e.target.value })}
                  rows={6}
                  className="w-full"
                  placeholder="Descreva como o agente deve se comportar, seu tom de voz, estilo de comunicação..."
                />
              </div>
              <Button onClick={handleSaveAgent} className="w-full">Salvar Estilo</Button>
            </CardContent>
          </Card>
        );
      case 'docs':
        return <Documentation />;
      case 'settings':
        return <SystemSettings />;
      case 'integrations':
        return <Integrations />;
      case 'delete':
        return <DeleteAccount />;
      case 'terms':
        return <TermsPrivacy />;
      case 'logout':
        localStorage.clear();
        window.location.href = '/';
        return null;
      case 'agents':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gerenciar Agentes</h3>
              <Button onClick={handleCreateAgent}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agente
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AgentAvatar agent={agent} size="md" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{agent.specialty}</p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setActiveTab('edit-agent');
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'edit-agent':
        if (!selectedAgent) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecione um agente para editar</p>
            </div>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações do Agente: {selectedAgent.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ... keep existing profile form content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                    <Input
                      type="text"
                      value={selectedAgent.name}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Título</label>
                    <Input
                      type="text"
                      value={selectedAgent.title}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, title: e.target.value })}
                    />
                  </div>
                  
                   <div>
                     <label className="block text-sm font-medium text-foreground mb-1">Especialidade</label>
                     <SpecialtySelector
                       selectedSpecialty={selectedAgent.specialty}
                       onSpecialtySelect={(specialty) => {
                         const generatedContent = generateAgentContent(specialty, selectedAgent);
                         setSelectedAgent({ ...selectedAgent, specialty, ...generatedContent });
                       }}
                     />
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Experiência</label>
                    <Input
                      type="text"
                      value={selectedAgent.experience}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, experience: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Abordagem</label>
                    <Input
                      type="text"
                      value={selectedAgent.approach}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, approach: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-foreground">Descrição</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const generatedContent = `Esta é uma descrição gerada automaticamente para ${selectedAgent.name}, especialista em ${selectedAgent.specialty}. Com ${selectedAgent.experience}, utiliza abordagem ${selectedAgent.approach} para proporcionar atendimento de qualidade.`;
                          setSelectedAgent({ ...selectedAgent, description: generatedContent });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Bot className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={selectedAgent.description}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-foreground">Persona</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const generatedPersona = `Sou ${selectedAgent.name}, ${selectedAgent.title} especializado em ${selectedAgent.specialty}. Tenho um estilo profissional e empático, sempre buscando criar um ambiente acolhedor e seguro para nossos diálogos. Minha comunicação é clara e respeitosa, adaptando-me às necessidades específicas de cada pessoa.`;
                          setSelectedAgent({ ...selectedAgent, personaStyle: generatedPersona });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Bot className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={selectedAgent.personaStyle || ''}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, personaStyle: e.target.value })}
                      rows={3}
                      placeholder="Como o agente deve se comportar..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Avatar</label>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Upload Personalizado</h4>
                      <CustomImageUpload
                        currentImage={selectedAgent.avatar}
                        onImageSelect={(avatar) => setSelectedAgent({ ...selectedAgent, avatar })}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Ou escolha um avatar predefinido</h4>
                      <AvatarPicker
                        selectedAvatar={selectedAgent.avatar || ''}
                        onAvatarSelect={(avatar) => setSelectedAgent({ ...selectedAgent, avatar })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Ícone da Profissão</label>
                  <IconPicker
                    selectedIcon={selectedAgent.icon}
                    onIconSelect={(icon) => setSelectedAgent({ ...selectedAgent, icon })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Cor do Tema</label>
                  <ColorPicker
                    selectedColor={selectedAgent.color}
                    onColorSelect={(color) => setSelectedAgent({ ...selectedAgent, color })}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleSaveAgent} className="flex-1">Salvar Perfil</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedAgent(null);
                    setActiveTab('agents');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'guidelines':
        if (!selectedAgent) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecione um agente para editar as diretrizes</p>
            </div>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Diretrizes: {selectedAgent.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Instruções para o Agente IA
                </label>
                <Textarea
                  value={selectedAgent.guidelines}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, guidelines: e.target.value })}
                  rows={12}
                  className="w-full font-mono text-sm"
                  placeholder="Digite as diretrizes que o AI deve seguir..."
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleSaveAgent} className="flex-1">Salvar Diretrizes</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedAgent(null);
                    setActiveTab('agents');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'persona':
        if (!selectedAgent) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecione um agente para editar a persona</p>
            </div>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Estilo da Persona: {selectedAgent.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Personalidade do Agente
                </label>
                <Textarea
                  value={selectedAgent.personaStyle}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, personaStyle: e.target.value })}
                  rows={6}
                  className="w-full"
                  placeholder="Descreva como o agente deve se comportar, seu tom de voz, estilo de comunicação..."
                />
              </div>
              
              <AIContentGenerator
                agentData={{
                  name: selectedAgent.name,
                  title: selectedAgent.title,
                  specialty: selectedAgent.specialty,
                  description: selectedAgent.description,
                  experience: selectedAgent.experience,
                  approach: selectedAgent.approach,
                  guidelines: selectedAgent.guidelines,
                  personaStyle: selectedAgent.personaStyle,
                  documentation: selectedAgent.documentation,
                }}
                onContentGenerated={(content) => {
                  setSelectedAgent({ 
                    ...selectedAgent, 
                    ...content 
                  });
                }}
              />
              <div className="flex gap-3">
                <Button onClick={handleSaveAgent} className="flex-1">Salvar Estilo</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedAgent(null);
                    setActiveTab('agents');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'history':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Histórico de Mensagens</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Total de mensagens: {messages.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Última conversa: {messages.length > 0 
                    ? new Date(messages[messages.length - 1].timestamp).toLocaleString()
                    : 'Nenhuma conversa ainda'
                  }
                </p>
              </div>
              <Button onClick={handleDownloadHistory} className="w-full" disabled={messages.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Histórico (.txt)
              </Button>
            </CardContent>
          </Card>
        );
      case 'docs':
        if (!selectedAgent) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecione um agente para editar a documentação</p>
            </div>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Documentação: {selectedAgent.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Base de Conhecimento
                </label>
                <Textarea
                  value={selectedAgent.documentation}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, documentation: e.target.value })}
                  rows={10}
                  className="w-full"
                  placeholder="Adicione informações, técnicas e conhecimentos específicos que o agente deve ter..."
                />
              </div>
              
              <AIContentGenerator
                agentData={{
                  name: selectedAgent.name,
                  title: selectedAgent.title,
                  specialty: selectedAgent.specialty,
                  description: selectedAgent.description,
                  experience: selectedAgent.experience,
                  approach: selectedAgent.approach,
                  guidelines: selectedAgent.guidelines,
                  personaStyle: selectedAgent.personaStyle,
                  documentation: selectedAgent.documentation,
                }}
                onContentGenerated={(content) => {
                  setSelectedAgent({ 
                    ...selectedAgent, 
                    ...content 
                  });
                }}
              />
              <div className="flex gap-3">
                <Button onClick={handleSaveAgent} className="flex-1">Salvar Documentação</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedAgent(null);
                    setActiveTab('agents');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'protocols':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Protocolos de Consulta</h3>
              <Button onClick={createNewProtocol}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Protocolo
              </Button>
            </div>
            
            {protocols.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum protocolo criado</h3>
                  <p className="text-muted-foreground mb-4">Crie seu primeiro protocolo de consulta para começar</p>
                  <Button onClick={createNewProtocol}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Protocolo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {protocols.map((protocol) => (
                  <Card key={protocol.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">Sessão #{protocol.sessionNumber}</h4>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {protocol.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{protocol.patientName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(protocol.date).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};
