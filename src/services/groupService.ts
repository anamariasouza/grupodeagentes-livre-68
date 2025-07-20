
import { Agent } from '@/types/agents';
import { Group, GroupMessage } from '@/types/groups';
import { UserProfile } from '@/types/user';

export interface GroupMistralMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

class GroupService {
  private moderatorApiKey = 'UEPqczZDK2ldyBmVYCJHJjIPZstU3WaJ'; // Chave do administrador/moderador do grupo
  private baseUrl = 'https://api.mistral.ai/v1/chat/completions';

  async getGroupResponse(
    message: string,
    conversationHistory: GroupMessage[],
    group: Group,
    agents: Agent[],
    mentions: string[] = [],
    userProfile?: UserProfile
  ): Promise<{ responses: { agentId: string; content: string }[] }> {
    const groupAgents = agents.filter(agent => group.members.includes(agent.id));
    const responses: { agentId: string; content: string }[] = [];
    
    // Adiciona data/hora atual ao contexto das mensagens
    const currentDateTime = new Date().toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Se há menções específicas, só esses agentes respondem
    if (mentions.length > 0) {
      const mentionedAgents = groupAgents.filter(agent => mentions.includes(agent.id));
      
      for (const agent of mentionedAgents) {
        const contextualMessage = message.includes('[Data/Hora atual:') ? message : `[Data/Hora atual: ${currentDateTime}] ${message}`;
        const response = await this.getAgentGroupResponse(contextualMessage, conversationHistory, agent, group, groupAgents, userProfile);
        if (response) {
          responses.push({ agentId: agent.id, content: response });
        }
      }
    } else {
      // Analisa qual agente deve responder baseado no conteúdo
      const shouldRespondAgent = await this.decideWhoShouldRespond(message, conversationHistory, groupAgents, userProfile);
      
      if (shouldRespondAgent) {
        const contextualMessage = message.includes('[Data/Hora atual:') ? message : `[Data/Hora atual: ${currentDateTime}] ${message}`;
        const response = await this.getAgentGroupResponse(contextualMessage, conversationHistory, shouldRespondAgent, group, groupAgents, userProfile);
        if (response) {
          responses.push({ agentId: shouldRespondAgent.id, content: response });
        }
      }
    }

    return { responses };
  }

  private async decideWhoShouldRespond(
    message: string,
    conversationHistory: GroupMessage[],
    groupAgents: Agent[],
    userProfile?: UserProfile
  ): Promise<Agent | null> {
    if (!this.moderatorApiKey) {
      throw new Error('Chave da API do moderador não configurada');
    }

    const recentMessages = conversationHistory.slice(-10);
    const conversationContext = recentMessages.map(msg => 
      `${msg.sender === 'user' ? (userProfile?.name || 'Usuário') : msg.senderName || 'Agente'}: ${msg.content}`
    ).join('\n');

    const agentsList = groupAgents.map(agent => 
      `${agent.id}: ${agent.name} - ${agent.specialty} (${agent.description})`
    ).join('\n');

    const userInfo = userProfile ? `
INFORMAÇÕES DO USUÁRIO:
Nome: ${userProfile.name}
Bio: ${userProfile.bio || 'Não informado'}
` : '';

    const systemPrompt = `Você é um coordenador de grupo de agentes especialistas. Analise a mensagem do usuário e o contexto da conversa para decidir qual agente deve responder.

${userInfo}

AGENTES DISPONÍVEIS:
${agentsList}

REGRAS:
1. Escolha APENAS UM agente que seja mais adequado para responder
2. Se a mensagem não for específica de nenhuma especialidade, escolha o agente mais genérico
3. Se for uma pergunta de acompanhamento sobre algo que outro agente disse, pode ser o mesmo agente
4. Se for uma saudação ou mensagem geral, escolha um agente aleatório
5. Responda APENAS com o ID do agente (ex: "marketing-digital")

CONTEXTO DA CONVERSA:
${conversationContext}

MENSAGEM ATUAL: ${message}

Responda apenas com o ID do agente que deve responder:`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.moderatorApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          max_tokens: 50,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const agentId = data.choices[0]?.message?.content?.trim();
      
      return groupAgents.find(agent => agent.id === agentId) || null;
    } catch (error) {
      console.error('Erro ao decidir quem deve responder:', error);
      // Fallback: retorna um agente aleatório
      return groupAgents[Math.floor(Math.random() * groupAgents.length)];
    }
  }

  private async getAgentGroupResponse(
    message: string,
    conversationHistory: GroupMessage[],
    agent: Agent,
    group: Group,
    groupAgents: Agent[],
    userProfile?: UserProfile
  ): Promise<string | null> {
    // Para as respostas dos agentes, usamos a mesma chave do moderador
    if (!this.moderatorApiKey) {
      throw new Error('Chave da API do moderador não configurada');
    }

    const recentMessages = conversationHistory.slice(-20);
    const conversationContext = recentMessages.map(msg => 
      `${msg.sender === 'user' ? (userProfile?.name || 'Usuário') : msg.senderName || 'Agente'}: ${msg.content}`
    ).join('\n');

    const otherAgents = groupAgents.filter(a => a.id !== agent.id);
    const agentsList = otherAgents.map(a => `${a.name} (${a.specialty})`).join(', ');

    const userInfo = userProfile ? `
INFORMAÇÕES DO USUÁRIO QUE VOCÊ ESTÁ ATENDENDO:
Nome: ${userProfile.name}
Bio: ${userProfile.bio || 'Não informado'}
Adapte sua comunicação ao perfil do usuário e trate-o pelo nome quando apropriado.
` : '';

    const systemPrompt = `Você é ${agent.name}, ${agent.title}.
    
CONTEXTO: Você está participando de um grupo chamado "${group.name}" com outros especialistas: ${agentsList}.

${userInfo}

SUA ESPECIALIDADE: ${agent.specialty}
SUA EXPERIÊNCIA: ${agent.experience}
SUA ABORDAGEM: ${agent.approach}
SUA DESCRIÇÃO: ${agent.description}

DIRETRIZES:
${agent.guidelines}

ESTILO DE PERSONALIDADE: ${agent.personaStyle}

CONHECIMENTO ESPECÍFICO:
${agent.documentation}

INSTRUÇÕES PARA CHAT EM GRUPO:
1. Você está em um grupo de especialistas trabalhando em colaboração
2. Responda apenas se a pergunta for da sua área de especialidade
3. Se outro agente já respondeu adequadamente, você pode complementar ou concordar brevemente
4. Se for mencionado com @ (ex: @${agent.name}), você deve responder sempre
5. Seja respeitoso com as contribuições dos outros agentes
6. Mantenha suas respostas focadas e profissionais
7. Você pode referenciar ou complementar o que outros agentes disseram
8. Se a pergunta não for da sua área, você pode indicar qual colega seria mais adequado
9. Trate o usuário pelo nome quando apropriado e considere seu perfil

CONTEXTO DA CONVERSA:
${conversationContext}

MENSAGEM ATUAL: ${message}

Responda como ${agent.name} de forma natural e profissional:`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.moderatorApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
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
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Erro ao gerar resposta do agente:', error);
      throw error;
    }
  }

  extractMentions(message: string, agents: Agent[]): string[] {
    const mentions: string[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      const mentionedName = match[1].toLowerCase();
      const agent = agents.find(a => 
        a.name.toLowerCase().includes(mentionedName) ||
        a.title.toLowerCase().includes(mentionedName) ||
        a.id.toLowerCase().includes(mentionedName)
      );
      
      if (agent && !mentions.includes(agent.id)) {
        mentions.push(agent.id);
      }
    }

    return mentions;
  }
}

export const groupService = new GroupService();
