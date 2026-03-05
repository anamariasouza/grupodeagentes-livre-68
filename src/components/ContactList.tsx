
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Search, MessageCircle, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Contact {
  id: string;
  user_id: string;
  contact_id: string;
  nickname: string | null;
  status: string;
  profile: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    status: string;
  };
}

interface ContactListProps {
  onStartChat: (contactId: string, contactName: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Contact[]>([]);
  const [addEmail, setAddEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadContacts();
      loadPendingRequests();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(`user_id.eq.${user.id},contact_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error loading contacts:', error);
      return;
    }

    // Load profiles for contacts
    const contactIds = (data || []).map(c => c.user_id === user.id ? c.contact_id : c.user_id);
    if (contactIds.length === 0) {
      setContacts([]);
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', contactIds);

    const contactsWithProfiles = (data || []).map(c => {
      const otherId = c.user_id === user.id ? c.contact_id : c.user_id;
      const profile = profiles?.find(p => p.id === otherId);
      return {
        ...c,
        profile: profile || { id: otherId, name: 'Usuário', email: '', avatar_url: null, status: 'offline' }
      };
    });

    setContacts(contactsWithProfiles);
  };

  const loadPendingRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('contact_id', user.id)
      .eq('status', 'pending');

    if (error) return;

    const userIds = (data || []).map(c => c.user_id);
    if (userIds.length === 0) {
      setPendingRequests([]);
      return;
    }

    const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);

    const requestsWithProfiles = (data || []).map(c => ({
      ...c,
      profile: profiles?.find(p => p.id === c.user_id) || { id: c.user_id, name: 'Usuário', email: '', avatar_url: null, status: 'offline' }
    }));

    setPendingRequests(requestsWithProfiles);
  };

  const handleAddContact = async () => {
    if (!user || !addEmail.trim()) return;
    setLoading(true);

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', addEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError || !profile) {
        toast.error('Usuário não encontrado. Verifique o email.');
        return;
      }

      if (profile.id === user.id) {
        toast.error('Você não pode adicionar a si mesmo!');
        return;
      }

      // Check if already a contact
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .or(`and(user_id.eq.${user.id},contact_id.eq.${profile.id}),and(user_id.eq.${profile.id},contact_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        toast.error('Este contato já foi adicionado!');
        return;
      }

      const { error } = await supabase.from('contacts').insert({
        user_id: user.id,
        contact_id: profile.id,
        status: 'pending'
      });

      if (error) {
        toast.error('Erro ao adicionar contato');
        return;
      }

      toast.success('Solicitação de contato enviada!');
      setAddEmail('');
      setIsAddDialogOpen(false);
      loadContacts();
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (contactId: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status: 'accepted' })
      .eq('id', contactId);

    if (!error) {
      toast.success('Contato aceito!');
      loadContacts();
      loadPendingRequests();
    }
  };

  const handleRejectRequest = async (contactId: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (!error) {
      toast.info('Solicitação rejeitada');
      loadPendingRequests();
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Contatos</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Adicionar Contato
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Digite o email da pessoa que deseja adicionar, igual ao MSN! 📧
                </p>
                <Input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="amigo@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                />
                <Button onClick={handleAddContact} disabled={loading || !addEmail.trim()} className="w-full">
                  {loading ? 'Buscando...' : 'Enviar Solicitação'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar contatos..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-3 border-b border-border bg-muted/50">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
            Solicitações pendentes ({pendingRequests.length})
          </p>
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={req.profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(req.profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{req.profile.name}</p>
                  <p className="text-xs text-muted-foreground">{req.profile.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAcceptRequest(req.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleRejectRequest(req.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum contato ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione amigos pelo email!</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onStartChat(contact.profile.id, contact.profile.name)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{getInitials(contact.profile.name)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${contact.profile.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.profile.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.profile.status === 'online' ? '🟢 Online' : '⚫ Offline'}</p>
                </div>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
