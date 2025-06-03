
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, saveClass, generateId } from '@/lib/storage';
import { Class, Announcement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const allClasses = getClasses();
    setClasses(allClasses);
    
    // Compilar todos os avisos
    const allAnnouncements: Announcement[] = [];
    allClasses.forEach(classData => {
      allAnnouncements.push(...classData.announcements);
    });
    
    // Ordenar por data (mais recente primeiro)
    allAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAnnouncements(allAnnouncements);
  }, []);

  const createAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim() || !user) return;

    const announcement: Announcement = {
      id: generateId(),
      title: newAnnouncement.title.trim(),
      content: newAnnouncement.content.trim(),
      classId: newAnnouncement.classId,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    if (newAnnouncement.classId === 'all') {
      // Adicionar para todas as classes
      const updatedClasses = classes.map(classData => ({
        ...classData,
        announcements: [...classData.announcements, announcement]
      }));
      
      updatedClasses.forEach(saveClass);
      setClasses(updatedClasses);
    } else {
      // Adicionar para uma classe específica
      const targetClass = classes.find(c => c.id === newAnnouncement.classId);
      if (targetClass) {
        const updatedClass = {
          ...targetClass,
          announcements: [...targetClass.announcements, announcement]
        };
        
        saveClass(updatedClass);
        setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
      }
    }

    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnnouncement({ title: '', content: '', classId: 'all' });
    setIsCreating(false);
    
    toast({
      title: "Aviso criado",
      description: "O aviso foi enviado com sucesso."
    });
  };

  const deleteAnnouncement = (announcementId: string) => {
    const updatedClasses = classes.map(classData => ({
      ...classData,
      announcements: classData.announcements.filter(a => a.id !== announcementId)
    }));
    
    updatedClasses.forEach(saveClass);
    setClasses(updatedClasses);
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    
    toast({
      title: "Aviso removido",
      description: "O aviso foi removido com sucesso."
    });
  };

  const getClassName = (classId: string) => {
    if (classId === 'all') return 'Todas as Classes';
    const classData = classes.find(c => c.id === classId);
    return classData?.name || 'Classe não encontrada';
  };

  const getUserName = (userId: string) => {
    // Em um app real, você buscaria o nome do usuário
    return 'Secretário';
  };

  if (user?.type === 'professor') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Avisos</h1>
          <p className="text-gray-600">Leia os avisos transmitidos pela secretaria</p>
        </div>

        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>Por: {getUserName(announcement.createdBy)}</span>
                        <Badge variant="outline">{getClassName(announcement.classId)}</Badge>
                      </CardDescription>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum aviso disponível</p>
              <p className="text-sm text-gray-400">Aguarde os avisos da secretaria</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avisos</h1>
        <p className="text-gray-600">Crie e gerencie avisos para as classes</p>
      </div>

      {/* Criar Novo Aviso */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Aviso
            </CardTitle>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                Criar Aviso
              </Button>
            )}
          </div>
        </CardHeader>
        
        {isCreating && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Aviso</Label>
              <Input
                id="title"
                placeholder="Digite o título do aviso"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                placeholder="Digite o conteúdo do aviso"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class">Destinatário</Label>
              <select
                id="class"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newAnnouncement.classId}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, classId: e.target.value }))}
              >
                <option value="all">Todas as Classes</option>
                {classes.map(classData => (
                  <option key={classData.id} value={classData.id}>
                    {classData.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={createAnnouncement} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Aviso
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewAnnouncement({ title: '', content: '', classId: 'all' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Avisos */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Avisos Enviados</h2>
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{getClassName(announcement.classId)}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum aviso criado</p>
            <p className="text-sm text-gray-400">Crie seu primeiro aviso para as classes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
