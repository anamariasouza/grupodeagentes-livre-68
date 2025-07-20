import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Clock, Zap } from 'lucide-react';
import { useUserStorage } from '@/hooks/useUserStorage';
import { Agent, defaultAgents } from '@/types/agents';
import { DEFAULT_USER_LIMITS } from '@/types/userLimits';

export const UserLimitsStatus: React.FC = () => {
  const [agents] = useUserStorage<Agent[]>('agents', defaultAgents);
  
  // Contabiliza apenas agentes criados pelo usuário
  const userCreatedAgents = agents.filter(agent => 
    !defaultAgents.some(defaultAgent => defaultAgent.id === agent.id)
  );

  const agentUsagePercentage = (userCreatedAgents.length / DEFAULT_USER_LIMITS.maxAgents) * 100;

  const limitCards = [
    {
      title: 'Agentes Criados',
      icon: Users,
      current: userCreatedAgents.length,
      max: DEFAULT_USER_LIMITS.maxAgents,
      percentage: agentUsagePercentage,
      color: agentUsagePercentage >= 100 ? 'text-red-500' : agentUsagePercentage >= 80 ? 'text-yellow-500' : 'text-green-500'
    },
    {
      title: 'Caracteres por Mensagem',
      icon: MessageSquare,
      current: 0,
      max: DEFAULT_USER_LIMITS.maxMessageLength,
      percentage: 0,
      color: 'text-blue-500',
      description: 'Limite por mensagem individual'
    },
    {
      title: 'Histórico de Chat',
      icon: Clock,
      current: 0,
      max: DEFAULT_USER_LIMITS.maxChatHistoryLength,
      percentage: 0,
      color: 'text-purple-500',
      description: 'Mensagens mantidas por chat'
    },
    {
      title: 'Interações Automáticas',
      icon: Zap,
      current: DEFAULT_USER_LIMITS.maxAgentSelfMessages,
      max: DEFAULT_USER_LIMITS.maxAgentRandomQuestions,
      percentage: 50,
      color: 'text-orange-500',
      description: 'Mensagens entre agentes e perguntas automáticas por dia'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {limitCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {card.current}
                <span className="text-sm font-normal text-muted-foreground">
                  /{card.max}
                </span>
              </div>
              <Badge 
                variant={card.percentage >= 100 ? "destructive" : card.percentage >= 80 ? "secondary" : "default"}
                className="ml-2"
              >
                {Math.round(card.percentage)}%
              </Badge>
            </div>
            
            <Progress 
              value={card.percentage} 
              className="h-2 mb-2"
            />
            
            {card.description && (
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            )}
            
            {card.title === 'Agentes Criados' && card.percentage >= 100 && (
              <p className="text-xs text-red-500 mt-1">
                Limite atingido. Considere fazer upgrade da conta.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};