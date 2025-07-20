import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DailyDisclaimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyDisclaimerDialog = ({ isOpen, onClose }: DailyDisclaimerDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Aviso Importante
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-slate-200 text-sm leading-relaxed">
            Os agentes disponíveis nesta plataforma são meramente para <strong>entretenimento</strong> e não são reais.
          </p>
          <p className="text-slate-200 text-sm leading-relaxed">
            A criação e configuração dos agentes são de <strong>responsabilidade exclusiva</strong> de seus criadores, que devem seguir um código de ética respeitando direitos e deveres.
          </p>
          <p className="text-slate-300 text-xs">
            Este aviso será exibido uma vez por dia.
          </p>
          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};