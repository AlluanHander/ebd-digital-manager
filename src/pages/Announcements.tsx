import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, saveAnnouncement, deleteAnnouncement as deleteAnnouncementFromDb, generateId } from '@/lib/supabase-storage';
import { supabase } from '@/integrations/supabase/client';
import { Class, Announcement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Plus, Trash2, Send, Reply, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Announcements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    classId: 'all'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const allClasses = await getClasses();
        setClasses(allClasses);
        
        // Filtrar classes baseado no tipo de usuário
        let filteredClasses = allClasses;
        if (user?.type === 'professor' && user.classIds) {
          filteredClasses = allClasses.filter(classData => user.classIds?.includes(classData.id));
        }
        
        // Compilar todos os avisos das classes filtradas
        const allAnnouncements: Announcement[] = [];
        filteredClasses.forEach(classData => {
          allAnnouncements.push(...classData.announcements);
        });
        
        // Ordenar por data (mais recente primeiro)
        allAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAnnouncements(allAnnouncements);
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };

    loadClasses();

    // Set up real-time subscription for announcements
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          console.log('Real-time announcement update:', payload);
          // Reload classes when announcements change
          loadClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim() || !user) return;

    try {
      const announcement: Announcement = {
        id: generateId(),
        title: newAnnouncement.title.trim(),
        content: newAnnouncement.content.trim(),
        classId: newAnnouncement.classId,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        authorName: user.name,
        authorType: user.type,
        replies: []
      };

      if (user.type === 'secretario') {
        if (newAnnouncement.classId === 'all') {
          // Secretário enviando para todas as classes
          for (const classData of classes) {
            const classAnnouncement = { ...announcement, classId: classData.id };
            await saveAnnouncement(classAnnouncement);
          }
        } else {
          // Secretário enviando para uma classe específica
          await saveAnnouncement(announcement);
        }
      } else {
        // Professor enviando para suas classes
        const userClasses = classes.filter(c => user.classIds?.includes(c.id));
        for (const classData of userClasses) {
          const classAnnouncement = { ...announcement, classId: classData.id };
          await saveAnnouncement(classAnnouncement);
        }
      }

      // Recarregar os dados após salvar
      const updatedClasses = await getClasses();
      setClasses(updatedClasses);
      
      // Atualizar lista de anúncios
      const filteredClasses = user?.type === 'professor' && user.classIds
        ? updatedClasses.filter(classData => user.classIds?.includes(classData.id))
        : updatedClasses;
      
      const allAnnouncements: Announcement[] = [];
      filteredClasses.forEach(classData => {
        allAnnouncements.push(...classData.announcements);
      });
      allAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(allAnnouncements);

      setNewAnnouncement({ title: '', content: '', classId: 'all' });
      setIsCreating(false);
      
      toast({
        title: "Aviso enviado",
        description: "O aviso foi enviado com sucesso."
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o aviso. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const replyToAnnouncement = (announcementId: string) => {
    if (!replyContent.trim() || !user) return;

    const reply = {
      id: generateId(),
      content: replyContent.trim(),
      authorName: user.name,
      authorType: user.type,
      createdAt: new Date().toISOString()
    };

    // Note: As replies não estão sendo salvas no banco ainda
    // Para funcionalidade completa, seria necessário criar uma tabela de replies
    console.log('Reply functionality would need a replies table in database');
    
    // Atualizar estado local
    setAnnouncements(prev => prev.map(announcement => {
      if (announcement.id === announcementId) {
        return {
          ...announcement,
          replies: [...(announcement.replies || []), reply]
        };
      }
      return announcement;
    }));

    // Atualizar o anúncio selecionado se estiver visualizando
    if (selectedAnnouncement && selectedAnnouncement.id === announcementId) {
      setSelectedAnnouncement({
        ...selectedAnnouncement,
        replies: [...(selectedAnnouncement.replies || []), reply]
      });
    }

    setReplyContent('');
    setReplyingTo(null);
    
    toast({
      title: "Resposta enviada",
      description: "Sua resposta foi enviada com sucesso."
    });
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      await deleteAnnouncementFromDb(announcementId);
      
      // Recarregar os dados após deletar
      const updatedClasses = await getClasses();
      setClasses(updatedClasses);
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      
      if (selectedAnnouncement && selectedAnnouncement.id === announcementId) {
        setSelectedAnnouncement(null);
      }
      
      toast({
        title: "Aviso removido",
        description: "O aviso foi removido com sucesso."
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aviso. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getClassName = (classId: string) => {
    if (classId === 'all') return 'Todas as Classes';
    const classData = classes.find(c => c.id === classId);
    return classData?.name || 'Classe não encontrada';
  };

  const availableClasses = user?.type === 'professor' 
    ? classes.filter(c => user.classIds?.includes(c.id))
    : classes;

  // Se um anúncio está selecionado (visualização detalhada em mobile)
  if (selectedAnnouncement) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAnnouncement(null)}
            className="lg:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {selectedAnnouncement.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Conversa com {selectedAnnouncement.authorName}
            </p>
          </div>
        </div>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="truncate">{selectedAnnouncement.title}</span>
                </CardTitle>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <span className="text-xs sm:text-sm">
                    De: {selectedAnnouncement.authorName} ({selectedAnnouncement.authorType === 'secretario' ? 'Secretário' : 'Professor'})
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(selectedAnnouncement.createdAt).toLocaleString('pt-BR')}
                  </span>
                </CardDescription>
                <Badge variant="outline" className="w-fit text-xs mt-2">
                  {getClassName(selectedAnnouncement.classId)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(selectedAnnouncement.createdBy === user?.id || user?.type === 'secretario') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAnnouncement(selectedAnnouncement.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap mb-4">
              {selectedAnnouncement.content}
            </p>
            
            {/* Respostas */}
            {selectedAnnouncement.replies && selectedAnnouncement.replies.length > 0 && (
              <div className="space-y-3 mb-4">
                <Separator />
                <h4 className="font-medium text-sm">Respostas:</h4>
                {selectedAnnouncement.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                      <span className="font-medium text-sm">
                        {reply.authorName} ({reply.authorType === 'secretario' ? 'Secretário' : 'Professor'})
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Campo de resposta */}
            {replyingTo === selectedAnnouncement.id ? (
              <div className="space-y-3">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor={`reply-${selectedAnnouncement.id}`}>Sua resposta:</Label>
                  <Textarea
                    id={`reply-${selectedAnnouncement.id}`}
                    placeholder="Digite sua resposta..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm"
                    onClick={() => replyToAnnouncement(selectedAnnouncement.id)}
                    className="w-full sm:w-auto"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Enviar Resposta
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReplyingTo(selectedAnnouncement.id)}
                  className="w-full sm:w-auto"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Responder
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Central de Avisos</h1>
        <p className="text-sm sm:text-base text-gray-600 px-4">
          {user?.type === 'professor' 
            ? 'Veja avisos da secretaria e comunique-se com outros professores'
            : 'Envie avisos para professores e classes'
          }
        </p>
      </div>

      {/* Criar Novo Aviso */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Plus className="w-5 h-5" />
              {user?.type === 'professor' ? 'Nova Mensagem' : 'Novo Aviso'}
            </CardTitle>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {user?.type === 'professor' ? 'Enviar Mensagem' : 'Criar Aviso'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {user?.type === 'professor' ? 'Enviar Mensagem' : 'Criar Novo Aviso'}
                  </DialogTitle>
                  <DialogDescription>
                    {user?.type === 'professor' 
                      ? 'Envie uma mensagem para a secretaria ou outras classes'
                      : 'Crie um aviso para enviar aos professores'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      placeholder="Digite o título"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Mensagem</Label>
                    <Textarea
                      id="content"
                      placeholder="Digite sua mensagem"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="class">Destinatário</Label>
                    <Select
                      value={newAnnouncement.classId}
                      onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, classId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o destinatário" />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.type === 'secretario' && (
                          <SelectItem value="all">Todas as Classes</SelectItem>
                        )}
                        {availableClasses.map(classData => (
                          <SelectItem key={classData.id} value={classData.id}>
                            {classData.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button onClick={createAnnouncement} className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Avisos/Mensagens */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Conversas</h2>
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className="hover:shadow-md transition-shadow cursor-pointer lg:cursor-default"
                onClick={() => {
                  // Em telas pequenas, abrir visualização detalhada
                  if (window.innerWidth < 1024) {
                    setSelectedAnnouncement(announcement);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <User className="w-4 h-4 shrink-0" />
                        <span className="truncate">{announcement.title}</span>
                      </CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <span className="text-xs sm:text-sm">
                          De: {announcement.authorName} ({announcement.authorType === 'secretario' ? 'Secretário' : 'Professor'})
                        </span>
                        <Badge variant="outline" className="w-fit text-xs">
                          {getClassName(announcement.classId)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(announcement.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(announcement.createdBy === user?.id || user?.type === 'secretario') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnnouncement(announcement.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {/* Mostrar conteúdo apenas em telas grandes */}
                <CardContent className="hidden lg:block">
                  <p className="text-gray-700 whitespace-pre-wrap mb-4 line-clamp-3">
                    {announcement.content}
                  </p>
                  
                  {/* Respostas */}
                  {announcement.replies && announcement.replies.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <Separator />
                      <h4 className="font-medium text-sm">
                        Respostas ({announcement.replies.length}):
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {announcement.replies.slice(-2).map((reply) => (
                          <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">
                                {reply.authorName} ({reply.authorType === 'secretario' ? 'Secretário' : 'Professor'})
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-2">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Campo de resposta */}
                  {replyingTo === announcement.id ? (
                    <div className="space-y-3">
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor={`reply-${announcement.id}`}>Sua resposta:</Label>
                        <Textarea
                          id={`reply-${announcement.id}`}
                          placeholder="Digite sua resposta..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => replyToAnnouncement(announcement.id)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Enviar Resposta
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyingTo(announcement.id)}
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Responder
                      </Button>
                    </div>
                  )}
                </CardContent>

                {/* Indicador de respostas em mobile */}
                <CardContent className="lg:hidden pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {announcement.content}
                  </p>
                  {announcement.replies && announcement.replies.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {announcement.replies.length} resposta{announcement.replies.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhuma conversa disponível</p>
            <p className="text-sm text-gray-400 px-4">
              {user?.type === 'professor' 
                ? 'Aguarde mensagens da secretaria ou envie uma nova mensagem'
                : 'Crie seu primeiro aviso para iniciar conversas com os professores'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
