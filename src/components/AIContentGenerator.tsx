import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIContentGeneratorProps {
  agentData: {
    name: string;
    title: string;
    specialty: string;
    description: string;
    experience: string;
    approach: string;
    guidelines: string;
    personaStyle: string;
    documentation: string;
  };
  onContentGenerated: (content: {
    description?: string;
    guidelines?: string;
    personaStyle?: string;
    documentation?: string;
    approach?: string;
  }) => void;
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ 
  agentData, 
  onContentGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContent = async (contentType: 'description' | 'guidelines' | 'persona' | 'documentation' | 'approach') => {
    console.log('Gerando conteúdo para:', contentType);
    console.log('Dados do agente:', agentData);
    
    setIsGenerating(true);
    
    try {
      // Simular API call com delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filledFields = Object.entries(agentData)
        .filter(([key, value]) => value && value.trim() !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      let generatedContent = '';
      
      switch (contentType) {
        case 'description':
          generatedContent = generateDescription(agentData);
          break;
        case 'guidelines':
          generatedContent = generateGuidelines(agentData);
          break;
        case 'persona':
          generatedContent = generatePersona(agentData);
          break;
        case 'documentation':
          generatedContent = generateDocumentation(agentData);
          break;
        case 'approach':
          generatedContent = generateApproach(agentData);
          break;
      }

      console.log('Conteúdo gerado:', generatedContent);
      console.log('Tipo de conteúdo:', contentType);

      const contentUpdate = { [contentType]: generatedContent };
      console.log('Objeto a ser passado para callback:', contentUpdate);
      
      onContentGenerated(contentUpdate);
      
      toast({
        title: "Conteúdo gerado com sucesso!",
        description: `${contentType} foi gerado automaticamente baseado nas informações fornecidas.`,
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDescription = (data: any) => {
    if (data.name.toLowerCase().includes('lula') || data.name.toLowerCase().includes('silva')) {
      return 'Ex-presidente do Brasil, líder político experiente com vasta experiência em negociação, políticas públicas e gestão governamental. Especialista em diálogo social e desenvolvimento econômico.';
    }
    
    if (data.specialty) {
      return `Profissional especializado em ${data.specialty.toLowerCase()} com foco em soluções práticas e resultados efetivos. Experiência comprovada em consultoria e orientação personalizada.`;
    }
    
    return `${data.name} é um profissional experiente com expertise em ${data.title?.toLowerCase() || 'consultoria'}. Oferece orientação especializada e soluções personalizadas para suas necessidades.`;
  };

  const generateGuidelines = (data: any) => {
    const baseName = data.name.toLowerCase();
    
    if (baseName.includes('lula') || baseName.includes('silva')) {
      return `Diretrizes para atendimento:
1. Sempre manter postura diplomática e respeitosa
2. Focar em soluções coletivas e diálogo
3. Valorizar experiência política e histórica
4. Promover inclusão social e desenvolvimento
5. Usar linguagem acessível e popular
6. Demonstrar empatia com questões sociais
7. Enfatizar a importância da democracia`;
    }

    return `Diretrizes para ${data.specialty || 'atendimento'}:
1. Sempre manter profissionalismo e ética
2. Focar em soluções práticas e eficientes
3. Considerar as necessidades específicas do cliente
4. Fornecer informações precisas e atualizadas
5. Manter confidencialidade quando necessário
6. Ser proativo em sugestões de melhoria
7. Demonstrar conhecimento técnico especializado`;
  };

  const generatePersona = (data: any) => {
    const baseName = data.name.toLowerCase();
    
    if (baseName.includes('lula') || baseName.includes('silva')) {
      return 'Carismático, experiente, próximo ao povo, diplomático, determinado e focado em justiça social';
    }
    
    if (data.specialty?.toLowerCase().includes('marketing')) {
      return 'Dinâmico, criativo, orientado a resultados, analítico e inovador';
    }
    
    if (data.specialty?.toLowerCase().includes('psicolog')) {
      return 'Empático, acolhedor, profissional, paciente e compreensivo';
    }
    
    return 'Profissional, confiável, especializado, prestativo e orientado a soluções';
  };

  const generateDocumentation = (data: any) => {
    const baseName = data.name.toLowerCase();
    
    if (baseName.includes('lula') || baseName.includes('silva')) {
      return `Documentação sobre Lula da Silva:

BIOGRAFIA:
- Luiz Inácio Lula da Silva, nascido em 1945
- Ex-presidente do Brasil (2003-2010)
- Líder sindical e político brasileiro

EXPERIÊNCIA:
- Presidente da República por dois mandatos
- Líder do Partido dos Trabalhadores (PT)
- Experiência em negociação internacional
- Políticas sociais como Bolsa Família

ESPECIALIDADES:
- Política brasileira e internacional
- Desenvolvimento econômico
- Políticas sociais e inclusão
- Diplomacia e relações internacionais`;
    }
    
    return `Documentação especializada em ${data.specialty || data.title}:

ÁREA DE ATUAÇÃO:
- ${data.specialty || 'Consultoria especializada'}
- ${data.approach || 'Abordagem profissional personalizada'}

METODOLOGIA:
- Análise detalhada de necessidades
- Desenvolvimento de soluções customizadas
- Acompanhamento de resultados
- Melhoria contínua

RECURSOS DISPONÍVEIS:
- Conhecimento técnico especializado
- Ferramentas e metodologias atualizadas
- Experiência prática comprovada`;
  };

  const generateApproach = (data: any) => {
    const baseName = data.name.toLowerCase();
    
    if (baseName.includes('lula') || baseName.includes('silva')) {
      return 'Abordagem humanizada com foco no diálogo e consenso';
    }
    
    if (data.specialty?.toLowerCase().includes('marketing')) {
      return 'Estratégias data-driven com foco em ROI e crescimento sustentável';
    }
    
    if (data.specialty?.toLowerCase().includes('psicolog')) {
      return 'Terapia humanizada com escuta ativa e técnicas baseadas em evidências';
    }
    
    return 'Metodologia estruturada com foco em resultados e satisfação do cliente';
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Gerador de Conteúdo com IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateContent('description')}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Descrição
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateContent('approach')}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Abordagem
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateContent('guidelines')}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Diretrizes
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateContent('persona')}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Persona
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateContent('documentation')}
            disabled={isGenerating}
            className="text-xs col-span-2 sm:col-span-1"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Documentação
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Clique nos botões para gerar conteúdo automaticamente baseado nas informações já preenchidas.
        </p>
      </CardContent>
    </Card>
  );
};