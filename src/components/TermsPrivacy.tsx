import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const TermsPrivacy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center space-x-2">
        <FileText className="h-6 w-6" />
        <span>Termos de Uso e Política de Privacidade</span>
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Termos de Uso</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Ao usar o Chathy, você concorda com os seguintes termos...</p>
          <h3>1. Aceitação dos Termos</h3>
          <p>O uso do sistema implica na aceitação integral destes termos.</p>
          <h3>2. Responsabilidades do Usuário</h3>
          <p>Você é responsável por todas as criações e interações na plataforma.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Política de Privacidade</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Esta política descreve como coletamos e usamos suas informações...</p>
          <h3>1. Dados Coletados</h3>
          <p>Coletamos apenas dados necessários para o funcionamento do sistema.</p>
          <h3>2. Uso dos Dados</h3>
          <p>Seus dados são usados exclusivamente para melhorar sua experiência.</p>
        </CardContent>
      </Card>
    </div>
  );
};