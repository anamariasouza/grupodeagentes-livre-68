import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Edit, Trash2, Save, Search, Tag } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const Documentation = () => {
  const [documents, setDocuments] = useLocalStorage<Document[]>('documentation', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const { toast } = useToast();

  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category).filter(Boolean)))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    if (!newDocument.title || !newDocument.content) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const tagsArray = newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (editingId) {
      setDocuments(prev => prev.map(doc =>
        doc.id === editingId
          ? { 
              ...doc, 
              ...newDocument, 
              tags: tagsArray,
              updatedAt: new Date() 
            }
          : doc
      ));
      setEditingId(null);
    } else {
      const document: Document = {
        id: Date.now().toString(),
        ...newDocument,
        tags: tagsArray,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setDocuments(prev => [...prev, document]);
    }

    setNewDocument({ title: '', content: '', category: '', tags: '' });
    setIsCreating(false);
    toast({
      title: "Sucesso",
      description: "Documento salvo com sucesso!",
    });
  };

  const handleEdit = (document: Document) => {
    setNewDocument({
      title: document.title,
      content: document.content,
      category: document.category,
      tags: document.tags.join(', ')
    });
    setEditingId(document.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Sucesso",
      description: "Documento excluído com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span>Documentação</span>
        </h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título, conteúdo ou tags..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as categorias' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Documento' : 'Novo Documento'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={newDocument.category}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Manual, Tutorial, FAQ"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={newDocument.tags}
                onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags separadas por vírgula"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={newDocument.content}
                onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Conteúdo do documento..."
                rows={10}
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
                  setNewDocument({ title: '', content: '', category: '', tags: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle>{document.title}</CardTitle>
                  {document.category && (
                    <span className="text-sm text-muted-foreground">
                      Categoria: {document.category}
                    </span>
                  )}
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {document.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(document)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                {document.content}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Criado em: {document.createdAt.toLocaleDateString('pt-BR')} | 
                Atualizado em: {document.updatedAt.toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDocuments.length === 0 && !isCreating && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Nenhum documento encontrado com os filtros aplicados.'
                  : 'Nenhum documento criado ainda.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};