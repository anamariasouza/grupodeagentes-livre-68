
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Agent } from '@/types/agents';
import { AgentAvatar } from './AgentAvatar';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <AgentAvatar agent={agent} size="lg" />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {agent.name}
            </h3>
            <Badge variant="secondary" className="mb-2">
              {agent.specialty}
            </Badge>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {agent.description}
            </p>
            <p className="text-xs text-gray-500">
              {agent.experience}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
