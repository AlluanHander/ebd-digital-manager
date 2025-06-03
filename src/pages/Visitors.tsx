
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, saveClass, generateId } from '@/lib/storage';
import { Class, Visitor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Visitors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const allClasses = getClasses();
    if (user?.type === 'professor') {
      const userClasses = allClasses.filter(c => 
        c.teacherIds.includes(user.id) || user.classIds?.includes(c.id)
      );
      setClasses(userClasses);
      if (userClasses.length > 0 && !selectedClass) {
        setSelectedClass(userClasses[0]);
      }
    } else {
      setClasses(allClasses);
    }
  }, [user]);

  const addVisitor = () => {
    if (!newVisitorName.trim() || !selectedClass) return;

    const visitor: Visitor = {
      id: generateId(),
      name: newVisitorName.trim(),
      classId: selectedClass.id,
      visitDate: todayDate,
      createdAt: new Date().toISOString()
    };

    const updatedClass = {
      ...selectedClass,
      visitors: [...selectedClass.visitors, visitor]
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    setNewVisitorName('');
    
    toast({
      title: "Visitante cadastrado",
      description: `${visitor.name} foi registrado como visitante.`
    });
  };

  const removeVisitor = (visitorId: string) => {
    if (!selectedClass) return;

    const updatedClass = {
      ...selectedClass,
      visitors: selectedClass.visitors.filter(v => v.id !== visitorId)
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    
    toast({
      title: "Visitante removido",
      description: "Visitante foi removido da lista."
    });
  };

  const getTodayVisitors = () => {
    if (!selectedClass) return [];
    return selectedClass.visitors.filter(v => v.visitDate === todayDate);
  };

  const getAllVisitors = () => {
    if (user?.type === 'secretario') {
      const allVisitors: (Visitor & { className: string })[] = [];
      classes.forEach(classData => {
        classData.visitors.forEach(visitor => {
          allVisitors.push({ ...visitor, className: classData.name });
        });
      });
      return allVisitors.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    }
    return selectedClass?.visitors.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()) || [];
  };

  const getClassName = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    return classData?.name || 'Classe não encontrada';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (user?.type === 'secretario') {
    const todayVisitorsAll = classes.reduce((total, classData) => {
      return total + classData.visitors.filter(v => v.visitDate === todayDate).length;
    }, 0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitantes</h1>
          <p className="text-gray-600">Visão geral de todos os visitantes</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <UserPlus className="w-5 h-5" />
                Visitantes Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{todayVisitorsAll}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Users className="w-5 h-5" />
                Total de Visitantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {classes.reduce((total, c) => total + c.visitors.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Calendar className="w-5 h-5" />
                Classes Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{classes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Visitantes por Classe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classData) => {
            const classVisitors = classData.visitors;
            const todayClassVisitors = classVisitors.filter(v => v.visitDate === todayDate);
            
            return (
              <Card key={classData.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {classData.name}
                  </CardTitle>
                  <CardDescription>
                    Professores: {classData.teacherNames.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Visitantes:</span>
                    <Badge variant="outline">{classVisitors.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visitantes Hoje:</span>
                    <Badge variant="default">{todayClassVisitors.length}</Badge>
                  </div>
                  
                  {todayClassVisitors.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Visitantes de hoje:</p>
                      {todayClassVisitors.map(visitor => (
                        <p key={visitor.id} className="text-sm font-medium">{visitor.name}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista Completa de Visitantes */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Completo de Visitantes</CardTitle>
            <CardDescription>Todos os visitantes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {getAllVisitors().length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getAllVisitors().map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{visitor.name}</p>
                        <p className="text-sm text-gray-500">
                          {'className' in visitor ? visitor.className : getClassName(visitor.classId)} • {formatDate(visitor.visitDate)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={visitor.visitDate === todayDate ? "default" : "outline"}>
                      {visitor.visitDate === todayDate ? "Hoje" : formatDate(visitor.visitDate)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum visitante registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitantes</h1>
        <p className="text-gray-600">Cadastre os visitantes da sua classe</p>
      </div>

      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações e Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastrar Visitante
              </CardTitle>
              <CardDescription>
                Classe: {selectedClass.name}<br />
                Data: {new Date(todayDate).toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Visitantes Hoje:</span>
                <Badge variant="default">{getTodayVisitors().length}</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Total de Visitantes:</span>
                <Badge variant="outline">{selectedClass.visitors.length}</Badge>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <Label htmlFor="visitor-name" className="text-sm font-medium">
                  Nome do Visitante
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="visitor-name"
                    placeholder="Digite o nome do visitante"
                    value={newVisitorName}
                    onChange={(e) => setNewVisitorName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addVisitor()}
                  />
                  <Button onClick={addVisitor} size="icon">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Visitantes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Lista de Visitantes
              </CardTitle>
              <CardDescription>
                Histórico de visitantes da classe {selectedClass.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedClass.visitors.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getAllVisitors().map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{visitor.name}</p>
                          <p className="text-sm text-gray-500">
                            Visitou em {formatDate(visitor.visitDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={visitor.visitDate === todayDate ? "default" : "outline"}>
                          {visitor.visitDate === todayDate ? "Hoje" : formatDate(visitor.visitDate)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVisitor(visitor.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum visitante registrado</p>
                  <p className="text-sm text-gray-400">Cadastre o primeiro visitante da sua classe</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma classe atribuída</p>
            <p className="text-sm text-gray-400">Entre em contato com o secretário para ser atribuído a uma classe</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
