import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users } from 'lucide-react';
import { DEFAULT_USER_LIMITS } from '@/types/userLimits';

interface AgentLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
}

export const AgentLimitDialog: React.FC<AgentLimitDialogProps> = ({
  isOpen,
  onClose,
  currentCount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Limite de Agentes Atingido
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Você já criou <span className="font-semibold text-foreground">{currentCount}</span> agentes, 
            que é o máximo permitido de <span className="font-semibold text-foreground">{DEFAULT_USER_LIMITS.maxAgents}</span> agentes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-4 my-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">Seus agentes ativos:</p>
              <p className="text-muted-foreground">
                {currentCount}/{DEFAULT_USER_LIMITS.maxAgents} agentes criados
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center mb-4">
          Para criar novos agentes, você pode desativar ou excluir agentes existentes que não está mais utilizando.
        </div>

        <div className="flex justify-center">
          <Button onClick={onClose} className="w-full">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};