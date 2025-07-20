import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, User } from 'lucide-react';
import { googleAIImageService } from '@/services/googleAIImageService';
import { useToast } from '@/hooks/use-toast';

interface AvatarGeneratorProps {
  onAvatarGenerated: (avatarUrl: string) => void;
  currentAvatar?: string;
}

export const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({
  onAvatarGenerated,
  currentAvatar
}) => {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<'realistic' | 'artistic' | 'cartoon' | 'anime'>('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateAvatar = async () => {
    if (!description.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, descreva como você gostaria que seu avatar fosse.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const fullDescription = `${style} style portrait of ${description}`;
      const avatarUrl = await googleAIImageService.generateUserAvatar(fullDescription);
      setGeneratedAvatar(avatarUrl);
      toast({
        title: "Avatar gerado!",
        description: "Seu novo avatar foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar avatar:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o avatar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAvatar = () => {
    if (generatedAvatar) {
      onAvatarGenerated(generatedAvatar);
      setIsOpen(false);
      toast({
        title: "Avatar atualizado!",
        description: "Seu avatar foi atualizado com sucesso.",
      });
    }
  };

  const handleReset = () => {
    setGeneratedAvatar(null);
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar Avatar com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Criar Avatar Personalizado
          </DialogTitle>
          <DialogDescription>
            Use IA para criar um avatar único baseado na sua descrição.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview do avatar atual */}
          {currentAvatar && !generatedAvatar && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avatar Atual</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img
                  src={currentAvatar}
                  alt="Avatar atual"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </CardContent>
            </Card>
          )}

          {/* Preview do avatar gerado */}
          {generatedAvatar && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Novo Avatar</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img
                  src={generatedAvatar}
                  alt="Avatar gerado"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </CardContent>
            </Card>
          )}

          {/* Formulário de geração */}
          {!generatedAvatar && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descreva seu avatar ideal
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: jovem profissional sorrindo, cabelos escuros, óculos"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Estilo do Avatar</Label>
                <Select value={style} onValueChange={(value: any) => setStyle(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realista</SelectItem>
                    <SelectItem value="artistic">Artístico</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateAvatar} 
                disabled={isGenerating || !description.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Avatar...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Avatar
                  </>
                )}
              </Button>
            </>
          )}

          {/* Ações para avatar gerado */}
          {generatedAvatar && (
            <div className="flex gap-2">
              <Button onClick={handleUseAvatar} className="flex-1">
                Usar Este Avatar
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Gerar Outro
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};