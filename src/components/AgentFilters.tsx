import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

interface AgentFiltersProps {
  selectedSpecialty: string;
  selectedExperience: string;
  onSpecialtyChange: (specialty: string) => void;
  onExperienceChange: (experience: string) => void;
  onClearFilters: () => void;
}

const specialties = [
  'Marketing Digital',
  'Gestão de Tráfego Pago',
  'Gestão de Redes Sociais',
  'Design Gráfico e Visual',
  'Planejamento Financeiro',
  'Contabilidade e Tributação',
  'Consultoria Jurídica',
  'Psicologia Clínica',
  'Humor e Entretenimento',
  'Língua Portuguesa',
  'Matemática',
  'Programação e Desenvolvimento',
  'Arquitetura e Design',
  'Engenharia',
  'Medicina',
  'Enfermagem',
  'Nutrição',
  'Educação Física',
  'Administração',
  'Recursos Humanos',
  'Vendas e Negociação',
  'Consultoria Empresarial',
  'Fotografia',
  'Jornalismo',
  'Tradução e Interpretação',
  'Culinária',
  'Música',
  'Turismo',
  'Veterinária',
  'Farmácia'
];

const experienceLevels = [
  '1-3 anos',
  '3-5 anos',
  '5-10 anos',
  '10+ anos'
];

export const AgentFilters: React.FC<AgentFiltersProps> = ({
  selectedSpecialty,
  selectedExperience,
  onSpecialtyChange,
  onExperienceChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedSpecialty !== 'all' || selectedExperience !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidade
          </label>
          <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as especialidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as especialidades</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experiência
          </label>
          <Select value={selectedExperience} onValueChange={onExperienceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer experiência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer experiência</SelectItem>
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedSpecialty && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{selectedSpecialty}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSpecialtyChange('')}
              />
            </Badge>
          )}
          {selectedExperience && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{selectedExperience}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onExperienceChange('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};