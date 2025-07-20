import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plug, Save, TestTube, ExternalLink, Key } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string;
  settings?: Record<string, any>;
}

const availableIntegrations: Omit<Integration, 'enabled' | 'apiKey' | 'webhookUrl' | 'settings'>[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecte com milhares de aplicativos através do Zapier'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receba notificações e gerencie agentes via Slack'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Integração com servidores Discord para bots'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Bot do Telegram para interações automatizadas'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Integração com WhatsApp Business API'
  },
  {
    id: 'email',
    name: 'Email/SMTP',
    description: 'Envio de emails automáticos e notificações'
  }
];

export const Integrations = () => {
  const [integrations, setIntegrations] = useLocalStorage<Integration[]>('integrations', 
    availableIntegrations.map(int => ({ ...int, enabled: false, settings: {} }))
  );
  const { toast } = useToast();

  const updateIntegration = (id: string, updates: Partial<Integration>) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id ? { ...integration, ...updates } : integration
    ));
  };

  const testIntegration = async (integration: Integration) => {
    toast({
      title: "Testando integração...",
      description: `Testando conexão com ${integration.name}`,
    });

    // Simular teste de conexão
    setTimeout(() => {
      if (integration.enabled && (integration.apiKey || integration.webhookUrl)) {
        toast({
          title: "Teste bem-sucedido",
          description: `Integração com ${integration.name} está funcionando!`,
        });
      } else {
        toast({
          title: "Teste falhou",
          description: `Configure as credenciais para ${integration.name}`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const saveIntegrations = () => {
    toast({
      title: "Sucesso",
      description: "Configurações de integração salvas!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Plug className="h-6 w-6" />
          <span>Integrações</span>
        </h2>
        <Button onClick={saveIntegrations}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Todas
        </Button>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{integration.name}</span>
                    {integration.enabled && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Ativo
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={integration.enabled}
                    onCheckedChange={(checked) => updateIntegration(integration.id, { enabled: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testIntegration(integration)}
                    disabled={!integration.enabled}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>
            </CardHeader>

            {integration.enabled && (
              <CardContent className="space-y-4">
                {/* Configurações específicas por integração */}
                {(integration.id === 'zapier' || integration.id === 'slack' || integration.id === 'discord') && (
                  <div className="space-y-2">
                    <Label htmlFor={`${integration.id}-webhook`}>Webhook URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`${integration.id}-webhook`}
                        type="url"
                        placeholder={`Cole a URL do webhook do ${integration.name}`}
                        value={integration.webhookUrl || ''}
                        onChange={(e) => updateIntegration(integration.id, { webhookUrl: e.target.value })}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={`https://${integration.id}.com`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {(integration.id === 'telegram' || integration.id === 'whatsapp' || integration.id === 'email') && (
                  <div className="space-y-2">
                    <Label htmlFor={`${integration.id}-api-key`}>
                      {integration.id === 'telegram' ? 'Bot Token' : 
                       integration.id === 'whatsapp' ? 'API Key' : 
                       'SMTP Password'}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`${integration.id}-api-key`}
                        type="password"
                        placeholder={`${integration.id === 'telegram' ? 'Token do bot' : 
                                     integration.id === 'whatsapp' ? 'Chave da API' : 
                                     'Senha SMTP'}`}
                        value={integration.apiKey || ''}
                        onChange={(e) => updateIntegration(integration.id, { apiKey: e.target.value })}
                      />
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {integration.id === 'email' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Servidor SMTP</Label>
                      <Input
                        placeholder="smtp.gmail.com"
                        value={integration.settings?.smtpServer || ''}
                        onChange={(e) => updateIntegration(integration.id, { 
                          settings: { ...integration.settings, smtpServer: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Porta</Label>
                      <Input
                        type="number"
                        placeholder="587"
                        value={integration.settings?.smtpPort || ''}
                        onChange={(e) => updateIntegration(integration.id, { 
                          settings: { ...integration.settings, smtpPort: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email de Envio</Label>
                      <Input
                        type="email"
                        placeholder="seu-email@gmail.com"
                        value={integration.settings?.fromEmail || ''}
                        onChange={(e) => updateIntegration(integration.id, { 
                          settings: { ...integration.settings, fromEmail: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {integration.id === 'zapier' && 
                    'Crie um Zap no Zapier e configure um webhook trigger para receber dados.'
                  }
                  {integration.id === 'slack' && 
                    'Configure um webhook incoming no seu workspace Slack.'
                  }
                  {integration.id === 'discord' && 
                    'Crie um webhook no seu servidor Discord.'
                  }
                  {integration.id === 'telegram' && 
                    'Crie um bot com @BotFather e use o token fornecido.'
                  }
                  {integration.id === 'whatsapp' && 
                    'Configure WhatsApp Business API com Meta/Facebook.'
                  }
                  {integration.id === 'email' && 
                    'Configure um servidor SMTP para envio de emails.'
                  }
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              As integrações permitem que o Chathy se conecte com outros serviços e aplicativos:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Zapier:</strong> Automatize fluxos de trabalho conectando com 5000+ apps</li>
              <li><strong>Slack/Discord:</strong> Receba notificações e gerencie agentes via chat</li>
              <li><strong>Telegram/WhatsApp:</strong> Crie bots para interação direta com usuários</li>
              <li><strong>Email:</strong> Envie notificações e relatórios automaticamente</li>
            </ul>
            <p className="text-amber-600">
              ⚠️ Mantenha suas chaves de API seguras e não as compartilhe com terceiros.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};