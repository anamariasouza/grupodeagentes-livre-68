
import { Agent } from '@/types/agents';
import { UserProfile } from '@/types/user';


export interface MistralMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AgentService {
  private apiKey = 'UEPqczZDK2ldyBmVYCJHJjIPZstU3WaJ';
  private baseUrl = 'https://api.mistral.ai/v1/chat/completions';

  async getAgentResponse(
    message: string, 
    conversationHistory: MistralMessage[], 
    agent: Agent,
    userProfile?: UserProfile,
    agentContext?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Chave da API Mistral não configurada');
    }

    const userInfo = userProfile ? `
INFORMAÇÕES DO USUÁRIO QUE VOCÊ ESTÁ ATENDENDO:
Nome: ${userProfile.name}
Bio: ${userProfile.bio || 'Não informado'}
Email: ${userProfile.email || 'Não informado'}
Adapte sua comunicação ao perfil do usuário e trate-o pelo nome sempre que apropriado.
` : '';

    const contextInfo = agentContext ? `
CONTEXTO DA SUA SALA VIRTUAL E MEMÓRIA:
${agentContext}
` : '';

    const systemPrompt = `Você é ${agent.name}, ${agent.title}.

${userInfo}

${contextInfo}

SUA ESPECIALIDADE: ${agent.specialty}
SUA EXPERIÊNCIA: ${agent.experience}
SUA ABORDAGEM: ${agent.approach}
SUA DESCRIÇÃO: ${agent.description}

DIRETRIZES IMPORTANTES:
${agent.guidelines}

ESTILO DE PERSONALIDADE:
${agent.personaStyle}

CONHECIMENTO ESPECÍFICO:
${agent.documentation}

LIMITAÇÕES DE RESPOSTA:
- Mantenha suas respostas com no máximo 800 caracteres
- Se precisar de mais espaço, seja conciso e vá direto ao ponto
- Divida respostas longas em partes menores se necessário

INSTRUÇÕES:
1. Responda sempre como ${agent.name}
2. Use seu conhecimento especializado em ${agent.specialty}
3. Mantenha o tom profissional, mas acolhedor
4. Se o usuário tiver nome, use-o na conversa de forma natural
5. Seja empático e compreensivo
6. Forneça respostas práticas e úteis
7. Se não souber algo específico, seja honesto sobre suas limitações

Responda de forma natural e profissional:`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      let responseContent = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      return responseContent;
    } catch (error) {
      console.error('Erro ao chamar a API Mistral:', error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
