import React from 'react';
import { Button } from '@/components/ui/button';
import { AvatarGenerator } from '@/components/AvatarGenerator';
import avatarBlackMan from '@/assets/avatar-black-man.jpg';
import avatarBlackWoman from '@/assets/avatar-black-woman.jpg';
import avatarLatinoMan from '@/assets/avatar-latino-man.jpg';
import avatarLatinaWoman from '@/assets/avatar-latina-woman.jpg';
import avatarAsianMan from '@/assets/avatar-asian-man.jpg';
import avatarAsianWoman from '@/assets/avatar-asian-woman.jpg';

const availableAvatars = [
  // Avatares especiais customizados
  '/lovable-uploads/395899f9-2985-465e-838d-f1d9ebe9a467.png', // Simpsom
  '/lovable-uploads/9b9bd4ba-9f38-4ca8-8511-98df652c19db.png', // Olivia Palito
  '/lovable-uploads/e9557126-2ae1-417e-99ec-04646026819f.png', // Albert Einstein
  '/lovable-uploads/2b5825b5-6740-461a-a48f-af574865cb85.png', // Walter White
  '/lovable-uploads/0fc0cc5f-b2dd-4e93-a09c-488663d3a46f.png', // She
  // Novos avatares diversos
  avatarBlackMan,
  avatarBlackWoman,
  avatarLatinoMan,
  avatarLatinaWoman,
  avatarAsianMan,
  avatarAsianWoman,
  // Avatares do Unsplash
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedAvatar, onAvatarSelect }) => {
  return (
    <div className="space-y-4">
      {/* Botão para gerar avatar com IA */}
      <div className="flex justify-center">
        <AvatarGenerator onAvatarGenerated={onAvatarSelect} />
      </div>

      <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
        {availableAvatars.map((avatarUrl, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => onAvatarSelect(avatarUrl)}
            className={`h-16 w-16 p-0 rounded-full border-2 ${
              selectedAvatar === avatarUrl ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <img
              src={avatarUrl}
              alt={`Avatar ${index + 1}`}
              className="w-full h-full rounded-full object-cover"
            />
          </Button>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        Clique em um avatar para selecioná-lo
      </div>
    </div>
  );
};