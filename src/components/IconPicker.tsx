
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, Heart, Brain, Baby, Briefcase, GraduationCap, 
  Users, MessageCircle, Shield, Activity, Stethoscope, 
  BookOpen, Calculator, Palette, Music, TreePine, 
  Target, Zap, Smile, Settings, Search, Camera, Code,
  Wrench, Hammer, Zap as Electric, Car, Home, Plane,
  Coffee, Utensils, Gamepad2, Laptop, Smartphone,
  Globe, Mail, Phone, Clock, Award, Star, Crown,
  Lightbulb, Rocket, Diamond, Gem, Gift, Trophy,
  Flag, Map, Compass, Mountain, Waves, Sun, Moon,
  Cloud, Snowflake, Flame, Leaf, Flower, Trees,
  Cat, Dog, Bird, Fish, Bug, Eye,
  Headphones, Mic, Speaker, Volume2, Radio, Tv,
  Pencil, Pen, Scissors, Ruler, PaintBucket, Brush
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const availableIcons = [
  // Pessoas e Profissões
  { name: 'User', component: User },
  { name: 'Users', component: Users },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Stethoscope', component: Stethoscope },
  { name: 'Shield', component: Shield },
  { name: 'Crown', component: Crown },
  
  // Medicina e Saúde
  { name: 'Heart', component: Heart },
  { name: 'Brain', component: Brain },
  { name: 'Activity', component: Activity },
  { name: 'Baby', component: Baby },
  { name: 'Eye', component: Eye },
  
  // Tecnologia e Desenvolvimento
  { name: 'Code', component: Code },
  { name: 'Laptop', component: Laptop },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Globe', component: Globe },
  { name: 'Zap', component: Zap },
  { name: 'Electric', component: Electric },
  { name: 'Settings', component: Settings },
  { name: 'Rocket', component: Rocket },
  
  // Ferramentas e Trabalho
  { name: 'Wrench', component: Wrench },
  { name: 'Hammer', component: Hammer },
  { name: 'Calculator', component: Calculator },
  { name: 'Pencil', component: Pencil },
  { name: 'Pen', component: Pen },
  { name: 'Scissors', component: Scissors },
  { name: 'Ruler', component: Ruler },
  
  // Design e Arte
  { name: 'Palette', component: Palette },
  { name: 'PaintBucket', component: PaintBucket },
  { name: 'Brush', component: Brush },
  { name: 'Camera', component: Camera },
  
  // Educação e Conhecimento
  { name: 'BookOpen', component: BookOpen },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'Award', component: Award },
  { name: 'Trophy', component: Trophy },
  { name: 'Star', component: Star },
  
  // Comunicação e Mídia
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'Mail', component: Mail },
  { name: 'Phone', component: Phone },
  { name: 'Mic', component: Mic },
  { name: 'Speaker', component: Speaker },
  { name: 'Headphones', component: Headphones },
  { name: 'Radio', component: Radio },
  { name: 'Tv', component: Tv },
  
  // Entretenimento e Lazer
  { name: 'Music', component: Music },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Smile', component: Smile },
  
  // Transporte e Viagem
  { name: 'Car', component: Car },
  { name: 'Plane', component: Plane },
  { name: 'Map', component: Map },
  { name: 'Compass', component: Compass },
  
  // Casa e Vida
  { name: 'Home', component: Home },
  { name: 'Coffee', component: Coffee },
  { name: 'Utensils', component: Utensils },
  { name: 'Gift', component: Gift },
  
  // Natureza e Ambiente
  { name: 'TreePine', component: TreePine },
  { name: 'Trees', component: Trees },
  { name: 'Leaf', component: Leaf },
  { name: 'Flower', component: Flower },
  { name: 'Mountain', component: Mountain },
  { name: 'Waves', component: Waves },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Cloud', component: Cloud },
  { name: 'Snowflake', component: Snowflake },
  { name: 'Flame', component: Flame },
  
  // Animais
  { name: 'Cat', component: Cat },
  { name: 'Dog', component: Dog },
  { name: 'Bird', component: Bird },
  { name: 'Fish', component: Fish },
  { name: 'Bug', component: Bug },
  
  // Outros
  { name: 'Target', component: Target },
  { name: 'Clock', component: Clock },
  { name: 'Flag', component: Flag },
  { name: 'Diamond', component: Diamond },
  { name: 'Gem', component: Gem },
  { name: 'Search', component: Search }
];

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onIconSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = availableIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar ícone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
        {filteredIcons.map((icon) => {
          const IconComponent = icon.component;
          return (
            <Button
              key={icon.name}
              variant={selectedIcon === icon.name ? "default" : "outline"}
              size="sm"
              onClick={() => onIconSelect(icon.name)}
              className="h-12 w-12 p-2"
            >
              <IconComponent className="h-5 w-5" />
            </Button>
          );
        })}
      </div>
      
      <div className="text-sm text-gray-600">
        Ícone selecionado: <span className="font-medium">{selectedIcon}</span>
      </div>
    </div>
  );
};
