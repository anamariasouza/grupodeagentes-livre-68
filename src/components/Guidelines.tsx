import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface Guideline {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Guidelines = () => {
  const [guidelines, setGuidelines] = useLocalStorage<Guideline[]>('guidelines', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGuideline, setNewGuideline] = useState({
    title: '',
    content: '',
    category: ''
  });
  const { toast } = useToast();

  const handleSave = () => {
    if (!newGuideline.title || !newGuideline.content) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setGuidelines(prev => prev.map(guideline =>
        guideline.id === editingId
          ? { ...guideline, ...newGuideline, updatedAt: new Date() }
          : guideline
      ));
      setEditingId(null);
    } else {
      const guideline: Guideline = {
        id: Date.now().toString(),
        ...newGuideline,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setGuidelines(prev => [...prev, guideline]);
    }

    setNewGuideline({ title: '', content: '', category: '' });
    setIsCreating(false);
    toast({
      title: "Sucesso",
      description: "Diretriz salva com sucesso!",
    });
  };

  const handleEdit = (guideline: Guideline) => {
    setNewGuideline({
      title: guideline.title,
      content: guideline.content,
      category: guideline.category
    });
    setEditingId(guideline.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setGuidelines(prev => prev.filter(guideline => guideline.id !== id));
    toast({
      title: "Sucesso",
      description: "Diretriz excluída com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span>Diretrizes dos Agentes</span>
        </h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Diretriz
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Diretriz' : 'Nova Diretriz'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newGuideline.title}
                onChange={(e) => setNewGuideline(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Diretrizes de Comunicação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={newGuideline.category}
                onChange={(e) => setNewGuideline(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Comunicação, Ética, Procedimentos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={newGuideline.content}
                onChange={(e) => setNewGuideline(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descreva as diretrizes detalhadamente..."
                rows={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setNewGuideline({ title: '', content: '', category: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {guidelines.map((guideline) => (
          <Card key={guideline.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{guideline.title}</CardTitle>
                  {guideline.category && (
                    <span className="text-sm text-muted-foreground">
                      Categoria: {guideline.category}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(guideline)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(guideline.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {guideline.content}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Criado em: {guideline.createdAt.toLocaleDateString('pt-BR')} | 
                Atualizado em: {guideline.updatedAt.toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}

        {guidelines.length === 0 && !isCreating && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma diretriz cadastrada ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};