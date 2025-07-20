import React, { useState } from 'react';
import { Plus, Users, MessageCircle, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Group, defaultGroups } from '@/types/groups';
import { Agent, defaultAgents } from '@/types/agents';
import { useUserStorage } from '@/hooks/useUserStorage';
import { GroupCreator } from './GroupCreator';
import { AgentAvatar } from './AgentAvatar';
import * as Icons from 'lucide-react';

interface GroupPortalProps {
  onGroupSelect: (group: Group) => void;
}

export const GroupPortal: React.FC<GroupPortalProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useUserStorage<Group[]>('groups', defaultGroups);
  const [agents] = useUserStorage<Agent[]>('agents', defaultAgents);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleCreateGroup = (group: Group) => {
    setGroups([...groups, group]);
    setShowCreateGroup(false);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowCreateGroup(true);
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    setEditingGroup(null);
    setShowCreateGroup(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const getGroupAgents = (memberIds: string[]): Agent[] => {
    return agents.filter(agent => memberIds.includes(agent.id));
  };

  if (showCreateGroup) {
    return (
      <GroupCreator
        agents={agents}
        onCreateGroup={editingGroup ? handleUpdateGroup : handleCreateGroup}
        onCancel={() => {
          setShowCreateGroup(false);
          setEditingGroup(null);
        }}
        editingGroup={editingGroup}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grupos de Especialistas</h2>
          <p className="text-gray-600">Converse com equipes completas de profissionais</p>
        </div>
        <Button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Grupo</span>
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const IconComponent = Icons[group.icon as keyof typeof Icons] as React.ComponentType<any>;
          const groupAgents = getGroupAgents(group.members);

          return (
            <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${group.color} flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {group.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {!group.isDefault && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Group Members */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Membros ({groupAgents.length})</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {groupAgents.slice(0, 3).map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-1">
                          <AgentAvatar agent={agent} size="sm" />
                          <span className="text-xs text-gray-600">{agent.name}</span>
                        </div>
                      ))}
                      {groupAgents.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{groupAgents.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Group Type */}
                  <div className="flex items-center justify-between">
                    <Badge variant={group.isDefault ? "default" : "outline"}>
                      {group.isDefault ? 'Padrão' : 'Personalizado'}
                    </Badge>
                    
                    <Button
                      onClick={() => onGroupSelect(group)}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Conversar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo criado</h3>
          <p className="text-gray-500 mb-4">Crie seu primeiro grupo de especialistas</p>
          <Button onClick={() => setShowCreateGroup(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </div>
      )}
    </div>
  );
};