
export interface Group {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  members: string[]; // IDs dos agentes
  isDefault: boolean;
  createdBy: 'user' | 'system';
  createdAt: Date;
}

export interface GroupMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  senderName?: string;
  senderAvatar?: string;
  agentId?: string;
  timestamp: Date;
  groupId: string;
  mentions?: string[]; // IDs dos agentes mencionados
  isResponse?: boolean; // Se é uma resposta a uma mensagem específica
  respondingTo?: string; // ID da mensagem que está respondendo
}

export const defaultGroups: Group[] = [
  {
    id: 'marketing-team',
    name: 'Equipe de Marketing',
    description: 'Especialistas em marketing digital, tráfego pago e social media',
    icon: 'TrendingUp',
    color: 'from-blue-500 to-cyan-500',
    members: ['marketing-digital', 'gestor-trafego', 'social-media'],
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date()
  },
  {
    id: 'business-team',
    name: 'Equipe de Negócios',
    description: 'Consultores em finanças, contabilidade e questões legais',
    icon: 'Briefcase',
    color: 'from-green-500 to-emerald-500',
    members: ['financeiro', 'contador', 'advogado'],
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date()
  },
  {
    id: 'education-team',
    name: 'Equipe Educacional',
    description: 'Professores especializados e apoio psicológico',
    icon: 'GraduationCap',
    color: 'from-purple-500 to-violet-500',
    members: ['prof-portugues', 'prof-matematica', 'psicologo'],
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date()
  }
];
