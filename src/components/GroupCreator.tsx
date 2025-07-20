import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/types/groups';
import { Agent } from '@/types/agents';
import { AgentAvatar } from './AgentAvatar';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';

interface GroupCreatorProps {
  agents: Agent[];
  onCreateGroup: (group: Group) => void;
  onCancel: () => void;
  editingGroup?: Group | null;
}

export const GroupCreator: React.FC<GroupCreatorProps> = ({ 
  agents, 
  onCreateGroup, 
  onCancel,
  editingGroup
}) => {
  const [name, setName] = useState(editingGroup?.name || '');
  const [description, setDescription] = useState(editingGroup?.description || '');
  const [selectedIcon, setSelectedIcon] = useState(editingGroup?.icon || 'Users');
  const [selectedColor, setSelectedColor] = useState(editingGroup?.color || 'from-blue-500 to-cyan-500');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(editingGroup?.members || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || selectedAgents.length === 0) return;

    const group: Group = {
      id: editingGroup?.id || `group-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      members: selectedAgents,
      isDefault: false,
      createdBy: 'user',
      createdAt: editingGroup?.createdAt || new Date()
    };

    onCreateGroup(group);
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const activeAgents = agents.filter(agent => agent.isActive);
  const selectedAgentData = activeAgents.filter(agent => selectedAgents.includes(agent.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
          </h2>
          <p className="text-gray-600">Configure seu grupo de especialistas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Grupo</CardTitle>
            <CardDescription>Configure o nome, descrição e aparência do grupo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Grupo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Equipe de Marketing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito e especialidades do grupo"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <IconPicker
                  selectedIcon={selectedIcon}
                  onIconSelect={setSelectedIcon}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <ColorPicker
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Membros</CardTitle>
            <CardDescription>Escolha os agentes que farão parte do grupo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Agents */}
            {selectedAgentData.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    Selecionados ({selectedAgentData.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAgentData.map((agent) => (
                    <Badge 
                      key={agent.id} 
                      variant="secondary" 
                      className="flex items-center space-x-2 pr-1"
                    >
                      <AgentAvatar agent={agent} size="sm" />
                      <span>{agent.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleAgent(agent.id)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Agents */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Agentes Disponíveis</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAgents.includes(agent.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <AgentAvatar agent={agent} size="sm" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <p className="text-xs text-gray-500">{agent.specialty}</p>
                      </div>
                      {selectedAgents.includes(agent.id) && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!name.trim() || selectedAgents.length === 0}
          >
            {editingGroup ? 'Atualizar Grupo' : 'Criar Grupo'}
          </Button>
        </div>
      </form>
    </div>
  );
};