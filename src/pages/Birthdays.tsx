
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, saveClass, generateId } from '@/lib/storage';
import { Class, Birthday } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cake, Plus, Trash2, Gift, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Birthdays = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [newBirthday, setNewBirthday] = useState({
    studentName: '',
    date: ''
  });
  const [todayBirthdays, setTodayBirthdays] = useState<Birthday[]>([]);

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

    // Calcular aniversariantes de hoje
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    const todayBirthdaysList: Birthday[] = [];
    allClasses.forEach(classData => {
      classData.birthdays.forEach(birthday => {
        if (birthday.month === todayMonth && birthday.day === todayDay) {
          todayBirthdaysList.push(birthday);
        }
      });
    });
    
    setTodayBirthdays(todayBirthdaysList);
  }, [user]);

  const addBirthday = () => {
    if (!newBirthday.studentName.trim() || !newBirthday.date || !selectedClass) return;

    const birthdayDate = new Date(newBirthday.date);
    const birthday: Birthday = {
      id: generateId(),
      studentId: generateId(),
      studentName: newBirthday.studentName.trim(),
      classId: selectedClass.id,
      date: newBirthday.date,
      month: birthdayDate.getMonth() + 1,
      day: birthdayDate.getDate(),
      createdAt: new Date().toISOString()
    };

    const updatedClass = {
      ...selectedClass,
      birthdays: [...selectedClass.birthdays, birthday]
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    setNewBirthday({ studentName: '', date: '' });
    
    // Atualizar aniversariantes de hoje se necessário
    const today = new Date();
    if (birthday.month === today.getMonth() + 1 && birthday.day === today.getDate()) {
      setTodayBirthdays(prev => [...prev, birthday]);
    }
    
    toast({
      title: "Aniversário cadastrado",
      description: `${birthday.studentName} foi adicionado à lista de aniversários.`
    });
  };

  const removeBirthday = (birthdayId: string) => {
    if (!selectedClass) return;

    const updatedClass = {
      ...selectedClass,
      birthdays: selectedClass.birthdays.filter(b => b.id !== birthdayId)
    };

    saveClass(updatedClass);
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    
    toast({
      title: "Aniversário removido",
      description: "Aniversário foi removido da lista."
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    });
  };

  const getClassName = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    return classData?.name || 'Classe não encontrada';
  };

  const getAllBirthdays = () => {
    const allBirthdays: Birthday[] = [];
    classes.forEach(classData => {
      allBirthdays.push(...classData.birthdays);
    });
    return allBirthdays.sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  };

  if (user?.type === 'secretario') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aniversários</h1>
          <p className="text-gray-600">Gerencie os aniversários de todos os alunos</p>
        </div>

        {/* Aniversariantes de Hoje */}
        {todayBirthdays.length > 0 && (
          <Alert className="border-pink-200 bg-pink-50">
            <Gift className="h-4 w-4 text-pink-600" />
            <AlertDescription className="text-pink-800">
              <strong>Aniversariantes de hoje:</strong> {todayBirthdays.map(b => b.studentName).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Lista Geral de Aniversários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getAllBirthdays().map((birthday) => (
            <Card key={birthday.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cake className="w-5 h-5 text-pink-500" />
                  {birthday.studentName}
                </CardTitle>
                <CardDescription>
                  Classe: {getClassName(birthday.classId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDate(birthday.date)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {getAllBirthdays().length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Cake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum aniversário cadastrado</p>
              <p className="text-sm text-gray-400">Os professores podem cadastrar aniversários em suas classes</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aniversários</h1>
        <p className="text-gray-600">Cadastre e acompanhe os aniversários dos alunos</p>
      </div>

      {/* Aniversariantes de Hoje */}
      {todayBirthdays.length > 0 && (
        <Alert className="border-pink-200 bg-pink-50">
          <Gift className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-pink-800">
            <strong>🎉 Aniversariantes de hoje:</strong> {todayBirthdays.map(b => b.studentName).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Cadastrar Aniversário
              </CardTitle>
              <CardDescription>
                Classe: {selectedClass.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Nome do Aluno</Label>
                <Input
                  id="student-name"
                  placeholder="Digite o nome do aluno"
                  value={newBirthday.studentName}
                  onChange={(e) => setNewBirthday(prev => ({ ...prev, studentName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthday-date">Data de Nascimento</Label>
                <Input
                  id="birthday-date"
                  type="date"
                  value={newBirthday.date}
                  onChange={(e) => setNewBirthday(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <Button onClick={addBirthday} className="w-full">
                <Cake className="w-4 h-4 mr-2" />
                Cadastrar Aniversário
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Aniversários */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Aniversários Cadastrados
              </CardTitle>
              <CardDescription>
                Lista de aniversários da classe {selectedClass.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedClass.birthdays.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedClass.birthdays
                    .sort((a, b) => {
                      if (a.month !== b.month) return a.month - b.month;
                      return a.day - b.day;
                    })
                    .map((birthday) => (
                    <div key={birthday.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Cake className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">{birthday.studentName}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(birthday.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getMonthName(birthday.month)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBirthday(birthday.id)}
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
                  <Cake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum aniversário cadastrado</p>
                  <p className="text-sm text-gray-400">Cadastre o primeiro aniversário da classe</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Cake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma classe atribuída</p>
            <p className="text-sm text-gray-400">Entre em contato com o secretário para ser atribuído a uma classe</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
