import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DeleteAccount = () => {
  const [confirmText, setConfirmText] = useState('');
  const [agreeToDelete, setAgreeToDelete] = useState(false);
  const [downloadData, setDownloadData] = useState(false);
  const { toast } = useToast();

  const handleExportData = () => {
    const data = {
      agents: localStorage.getItem('agents'),
      userProfile: localStorage.getItem('user-profile'),
      chatHistory: localStorage.getItem('chat-history'),
      guidelines: localStorage.getItem('guidelines'),
      personas: localStorage.getItem('personas'),
      documentation: localStorage.getItem('documentation'),
      integrations: localStorage.getItem('integrations'),
      systemSettings: localStorage.getItem('system-settings'),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chathy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Dados exportados",
      description: "Seus dados foram baixados com sucesso!",
    });
  };

  const handleDeleteAccount = () => {
    if (confirmText !== 'DELETAR CONTA' || !agreeToDelete) {
      toast({
        title: "Erro",
        description: "Por favor, confirme todos os requisitos para deletar a conta",
        variant: "destructive",
      });
      return;
    }

    // Fazer backup se solicitado
    if (downloadData) {
      handleExportData();
    }

    // Simular deleção da conta (limpar localStorage)
    setTimeout(() => {
      localStorage.clear();
      toast({
        title: "Conta deletada",
        description: "Sua conta e todos os dados foram deletados permanentemente.",
      });
      
      // Redirecionar para página inicial após um delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }, 1000);
  };

  const isDeleteEnabled = confirmText === 'DELETAR CONTA' && agreeToDelete;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Zona de Perigo</h2>
      </div>

      {/* Exportar Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Exportar Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Baixe uma cópia de todos os seus dados antes de deletar a conta.
          </p>
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar Meus Dados
          </Button>
        </CardContent>
      </Card>

      {/* Deletar Conta */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Deletar Conta</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ ATENÇÃO: Esta ação é irreversível!</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Todos os seus agentes serão deletados permanentemente</li>
              <li>• Todo o histórico de conversas será perdido</li>
              <li>• Todas as diretrizes e personas serão removidas</li>
              <li>• Documentações e configurações serão apagadas</li>
              <li>• Não será possível recuperar os dados após a deleção</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="download-before-delete"
                checked={downloadData}
                onCheckedChange={(checked) => setDownloadData(checked === true)}
              />
              <Label htmlFor="download-before-delete" className="text-sm">
                Fazer backup dos meus dados antes de deletar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree-delete"
                checked={agreeToDelete}
                onCheckedChange={(checked) => setAgreeToDelete(checked === true)}
              />
              <Label htmlFor="agree-delete" className="text-sm">
                Eu entendo que esta ação é irreversível e aceito perder todos os dados
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Digite "DELETAR CONTA" para confirmar:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETAR CONTA"
                className={confirmText === 'DELETAR CONTA' ? 'border-red-500' : ''}
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={!isDeleteEnabled}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Conta Permanentemente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá deletar permanentemente sua conta
                    e remover todos os seus dados dos nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, deletar minha conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Alternativas */}
      <Card>
        <CardHeader>
          <CardTitle>Alternativas à deleção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Antes de deletar sua conta, considere estas alternativas:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Pausa temporária:</strong> Desative as notificações e pare de usar temporariamente</li>
              <li><strong>Exportar dados:</strong> Baixe seus dados e continue usando em outro lugar</li>
              <li><strong>Limpar histórico:</strong> Delete apenas o histórico de conversas mantendo os agentes</li>
              <li><strong>Suporte:</strong> Entre em contato conosco se há algo específico que podemos melhorar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};