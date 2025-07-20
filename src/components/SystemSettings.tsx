import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  systemName: string;
  maxAgents: number;
  enableNotifications: boolean;
  autoSaveInterval: number;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
  backupInterval: number;
  maxHistoryDays: number;
}

const defaultSettings: SystemSettings = {
  systemName: 'Chathy Admin',
  maxAgents: 10,
  enableNotifications: true,
  autoSaveInterval: 30,
  enableAnalytics: false,
  enableDebugMode: false,
  backupInterval: 24,
  maxHistoryDays: 30
};

export const SystemSettings = () => {
  const [settings, setSettings] = useLocalStorage<SystemSettings>('system-settings', defaultSettings);
  const [tempSettings, setTempSettings] = useState<SystemSettings>(settings);
  const { toast } = useToast();

  const handleSave = () => {
    setSettings(tempSettings);
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    });
  };

  const handleReset = () => {
    setTempSettings(defaultSettings);
    toast({
      title: "Sucesso",
      description: "Configurações restauradas para o padrão!",
    });
  };

  const handleResetLocalStorage = () => {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados locais (agentes personalizados, conversas, configurações). Esta ação não pode ser desfeita. Tem certeza que deseja continuar?')) {
      if (confirm('Esta é sua última chance! Confirma que deseja resetar TODOS os dados do usuário?')) {
        localStorage.clear();
        toast({
          title: "Dados Apagados",
          description: "Todos os dados foram removidos. A página será recarregada.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Settings className="h-6 w-6" />
          <span>Configurações do Sistema</span>
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nome do Sistema</Label>
              <Input
                id="systemName"
                value={tempSettings.systemName}
                onChange={(e) => updateSetting('systemName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAgents">Máximo de Agentes</Label>
              <Input
                id="maxAgents"
                type="number"
                min="1"
                max="100"
                value={tempSettings.maxAgents}
                onChange={(e) => updateSetting('maxAgents', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHistoryDays">Dias de Histórico (dias)</Label>
              <Input
                id="maxHistoryDays"
                type="number"
                min="1"
                max="365"
                value={tempSettings.maxHistoryDays}
                onChange={(e) => updateSetting('maxHistoryDays', parseInt(e.target.value) || 1)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Comportamento */}
        <Card>
          <CardHeader>
            <CardTitle>Comportamento do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações do sistema
                </p>
              </div>
              <Switch
                checked={tempSettings.enableNotifications}
                onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Coletar dados de uso para melhorias
                </p>
              </div>
              <Switch
                checked={tempSettings.enableAnalytics}
                onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Debug</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar logs detalhados para desenvolvimento
                </p>
              </div>
              <Switch
                checked={tempSettings.enableDebugMode}
                onCheckedChange={(checked) => updateSetting('enableDebugMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="autoSaveInterval">Intervalo de Auto-Save (segundos)</Label>
              <Input
                id="autoSaveInterval"
                type="number"
                min="10"
                max="300"
                value={tempSettings.autoSaveInterval}
                onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value) || 30)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupInterval">Intervalo de Backup (horas)</Label>
              <Input
                id="backupInterval"
                type="number"
                min="1"
                max="168"
                value={tempSettings.backupInterval}
                onChange={(e) => updateSetting('backupInterval', parseInt(e.target.value) || 24)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Zona de Perigo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 p-4 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2">
                Reset Completo do Sistema
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Esta ação irá apagar TODOS os dados locais incluindo agentes personalizados, 
                histórico de conversas, configurações e preferências. Esta ação não pode ser desfeita.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleResetLocalStorage}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Todos os Dados do Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Versão</Label>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Última Atualização</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Agentes Ativos</Label>
                <p className="text-sm text-muted-foreground">
                  {JSON.parse(localStorage.getItem('agents') || '[]').filter((a: any) => a.isActive).length}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Espaço Usado</Label>
                <p className="text-sm text-muted-foreground">
                  {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};