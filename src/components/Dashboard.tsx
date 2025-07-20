import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  TrendingUp,
  Clock,
  Star,
  Activity,
  Calendar
} from 'lucide-react';
import { useUserStorage } from '@/hooks/useUserStorage';
import { Agent, defaultAgents } from '@/types/agents';
import { UserProfile, defaultUserProfile } from '@/types/user';
import { Message } from '@/types';
import { AgentAvatar } from './AgentAvatar';
import { UserLimitsStatus } from './UserLimitsStatus';
import defaultUserAvatar from '@/assets/default-user-avatar.png';

export const Dashboard = () => {
  const [agents] = useUserStorage<Agent[]>('agents', defaultAgents);
  const [userProfile] = useUserStorage<UserProfile>('user-profile', defaultUserProfile);
  const [messages] = useUserStorage<Message[]>('chat-history', []);

  const activeAgents = agents.filter(agent => agent.isActive);
  const totalInteractions = messages.length;
  const lastInteraction = messages.length > 0 
    ? new Date(messages[messages.length - 1].timestamp).toLocaleDateString('pt-BR')
    : 'Nenhuma';

  const stats = [
    {
      title: 'Total de Agentes',
      value: agents.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Agentes Ativos',
      value: activeAgents.length,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Interações Totais',
      value: totalInteractions,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Protocolos',
      value: 0,
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
            <img 
              src={userProfile.avatar || defaultUserAvatar} 
              alt="Avatar do usuário"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo de volta, {userProfile.name || 'Usuário'}!</h2>
            <p className="text-blue-100">Gerencie seus agentes IA e acompanhe suas interações</p>
          </div>
        </div>
      </div>

      {/* User Limits Status */}
      <UserLimitsStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agentes Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Seus Agentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAgents.slice(0, 4).map((agent) => (
                <div key={agent.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <AgentAvatar agent={agent} size="sm" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">{agent.specialty}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Ativo</span>
                  </div>
                </div>
              ))}
              {agents.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum agente criado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Última Interação</p>
                  <p className="text-xs text-muted-foreground">{lastInteraction}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Agentes Configurados</p>
                  <p className="text-xs text-muted-foreground">
                    {agents.length} agente{agents.length !== 1 ? 's' : ''} no sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Perfil Configurado</p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile.name ? 'Perfil completo' : 'Configure seu perfil'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Resumo do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalInteractions}</div>
                <div className="text-sm text-muted-foreground">Total de Mensagens</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{activeAgents.length}</div>
                <div className="text-sm text-muted-foreground">Agentes Ativos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {userProfile.name || 'Não definido'}
                </div>
                <div className="text-sm text-muted-foreground">Usuário</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Criar Novo Agente</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Ver Histórico</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Agendar Protocolo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};