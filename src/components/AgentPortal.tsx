
import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AgentCard } from './AgentCard';
import { AgentFilters } from './AgentFilters';
import { AgentLimitDialog } from './AgentLimitDialog';
import { Agent } from '@/types/agents';
import { useUserStorage } from '@/hooks/useUserStorage';
import { defaultAgents } from '@/types/agents';
import { checkUserLimits, DEFAULT_USER_LIMITS } from '@/types/userLimits';

interface AgentPortalProps {
  onAgentSelect: (agent: Agent) => void;
  onCreateAgent?: () => void;
}

export const AgentPortal: React.FC<AgentPortalProps> = ({ onAgentSelect, onCreateAgent }) => {
  const [agents, setAgents] = useUserStorage<Agent[]>('agents', defaultAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  
  // Contabiliza apenas agentes criados pelo usuário (não os padrão)
  const userCreatedAgents = agents.filter(agent => !defaultAgents.some(defaultAgent => defaultAgent.id === agent.id));
  const canCreateMoreAgents = checkUserLimits.canCreateAgent(userCreatedAgents.length);

  const handleCreateAgent = () => {
    if (!canCreateMoreAgents) {
      setShowLimitDialog(true);
      return;
    }
    onCreateAgent?.();
  };
  
  // Assegura que os agentes padrão sejam carregados se não houver dados salvos
  useEffect(() => {
    if (agents.length === 0) {
      setAgents(defaultAgents);
    }
  }, [agents.length, setAgents]);

  const filteredAgents = agents.filter(agent => {
    if (!agent.isActive) return false;
    
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || agent.specialty === selectedSpecialty;
    
    const matchesExperience = selectedExperience === 'all' || 
      agent.experience.toLowerCase().includes(selectedExperience.toLowerCase());
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const handleClearFilters = () => {
    setSelectedSpecialty('all');
    setSelectedExperience('all');
    setSearchTerm('');
  };

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6">
      {/* User limits info */}
      {!canCreateMoreAgents && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você atingiu o limite de {DEFAULT_USER_LIMITS.maxAgents} agentes criados. 
            Para criar mais agentes, considere fazer upgrade da sua conta.
          </AlertDescription>
        </Alert>
      )}

      {/* Header with search and create button */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar especialista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>
          
          {onCreateAgent && (
            <Button 
              onClick={handleCreateAgent}
              disabled={!canCreateMoreAgents}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Agente ({userCreatedAgents.length}/{DEFAULT_USER_LIMITS.maxAgents})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 md:mb-8">
        <AgentFilters
          selectedSpecialty={selectedSpecialty}
          selectedExperience={selectedExperience}
          onSpecialtyChange={setSelectedSpecialty}
          onExperienceChange={setSelectedExperience}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Agents Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onAgentSelect(agent)}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum agente encontrado para "{searchTerm}"
          </p>
        </div>
      )}

      {/* Agent Limit Dialog */}
      <AgentLimitDialog
        isOpen={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        currentCount={userCreatedAgents.length}
      />
    </div>
  );
};
