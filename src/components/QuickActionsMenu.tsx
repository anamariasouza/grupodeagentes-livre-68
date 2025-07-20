import React from 'react';
import { Plus, Users, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuickActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: () => void;
  onCreateGroup: () => void;
  onViewChats: () => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  isOpen,
  onClose,
  onCreateAgent,
  onCreateGroup,
  onViewChats
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 relative animate-scale-in">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Ações Rápidas</h3>
          <p className="text-sm text-gray-600">O que você gostaria de fazer?</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              onCreateAgent();
              onClose();
            }}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl flex items-center justify-start space-x-3 px-4"
          >
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Novo Agente</div>
              <div className="text-sm opacity-90">Criar um assistente personalizado</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              onCreateGroup();
              onClose();
            }}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl flex items-center justify-start space-x-3 px-4"
          >
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Novo Grupo</div>
              <div className="text-sm opacity-90">Reunir agentes especialistas</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              onViewChats();
              onClose();
            }}
            variant="outline"
            className="w-full h-14 border-2 rounded-xl flex items-center justify-start space-x-3 px-4 hover:bg-gray-50"
          >
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Ver Conversas</div>
              <div className="text-sm text-gray-600">Acessar chats existentes</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};