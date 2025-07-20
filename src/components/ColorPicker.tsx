
import React from 'react';
import { Button } from '@/components/ui/button';

const availableColors = [
  { name: 'Azul', value: 'from-blue-500 to-cyan-500' },
  { name: 'Verde', value: 'from-green-500 to-emerald-500' },
  { name: 'Roxo', value: 'from-purple-500 to-pink-500' },
  { name: 'Rosa', value: 'from-pink-500 to-rose-500' },
  { name: 'Laranja', value: 'from-orange-500 to-red-500' },
  { name: 'Amarelo', value: 'from-yellow-500 to-orange-500' },
  { name: 'Índigo', value: 'from-indigo-500 to-purple-500' },
  { name: 'Teal', value: 'from-teal-500 to-cyan-500' },
  { name: 'Vermelho', value: 'from-red-500 to-pink-500' },
  { name: 'Cinza', value: 'from-gray-500 to-slate-500' }
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {availableColors.map((color) => (
          <Button
            key={color.value}
            variant="ghost"
            onClick={() => onColorSelect(color.value)}
            className={`h-12 w-12 p-0 rounded-lg border-2 ${
              selectedColor === color.value ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <div className={`w-full h-full rounded-lg bg-gradient-to-r ${color.value}`} />
          </Button>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        Cor selecionada: <span className="font-medium">
          {availableColors.find(c => c.value === selectedColor)?.name || 'Personalizada'}
        </span>
      </div>
    </div>
  );
};
