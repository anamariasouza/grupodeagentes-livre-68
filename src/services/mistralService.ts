
const MISTRAL_API_KEY = 'NfZU1cM5z0d87SRrVUjdVOfZoAGDHjTu';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PsychologistProfile {
  name: string;
  specialty: string;
  experience: string;
  approach: string;
  bio: string;
  guidelines: string;
  personaStyle: string;
  documentation: string;
}

export class MistralService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || MISTRAL_API_KEY;
  }

  async sendMessage(messages: MistralMessage[]): Promise<string> {
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
    } catch (error) {
      console.error('Erro ao comunicar com Mistral:', error);
      throw error;
    }
  }

  async getPsychologistResponse(userMessage: string, conversationHistory: MistralMessage[], profile?: PsychologistProfile): Promise<string> {
    const psychProfile = profile || this.getProfileFromStorage();
    
    const systemPrompt: MistralMessage = {
      role: 'system',
      content: `Você é ${psychProfile.name}, especializado em ${psychProfile.specialty}.
      
Sua abordagem: ${psychProfile.approach}
Sobre você: ${psychProfile.bio}
Seu estilo: ${psychProfile.personaStyle}

Você é um assistente inteligente e versátil que pode:
- Responder perguntas de forma natural e útil
- Criar conteúdo web (landing pages, sites, etc.) diretamente
- Ajudar com desenvolvimento e programação
- Fornecer soluções práticas e eficientes
- Adaptar-se às necessidades específicas de cada usuário

IMPORTANTE: 
- Responda diretamente ao que o usuário solicita
- Se pedirem para criar algo, faça-o imediatamente
- Seja prático e eficiente
- Evite fazer perguntas desnecessárias se já tem informações suficientes
- Mantenha o foco na solução do problema apresentado`
    };

    const messages = [systemPrompt, ...conversationHistory, { role: 'user' as const, content: userMessage }];
    return await this.sendMessage(messages);
  }

  private getProfileFromStorage(): PsychologistProfile {
    try {
      const stored = localStorage.getItem('psychologist-profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao ler perfil do localStorage:', error);
    }
    
    return {
      name: 'Assistente IA',
      specialty: 'Desenvolvimento Web',
      experience: 'Especialista em criação de landing pages e desenvolvimento web',
      approach: 'Soluções práticas e diretas',
      bio: 'Assistente especializado em criar landing pages e desenvolvimento web.',
      guidelines: `Diretrizes para atendimento:
1. Responder diretamente às solicitações
2. Criar soluções completas quando solicitado
3. Ser eficiente e prático
4. Focar na entrega de resultados
5. Adaptar-se às necessidades do usuário`,
      personaStyle: 'Direto, eficiente e solucionador',
      documentation: 'Especialista em desenvolvimento web e criação de landing pages'
    };
  }
}

export const mistralService = new MistralService();
