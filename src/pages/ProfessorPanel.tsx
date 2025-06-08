
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Phone, User, LogOut, BookOpen, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLoggedProfessor, logoutProfessor, getClasses } from '@/lib/storage';
import { Class } from '@/types';

export const ProfessorPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professor, setProfessor] = useState(user);
  const [professorClasses, setProfessorClasses] = useState<Class[]>([]);

  useEffect(() => {
    // Verificar se há um professor logado no localStorage
    const loggedProfessor = getLoggedProfessor();
    console.log('Professor logado encontrado no localStorage:', loggedProfessor);
    
    if (loggedProfessor) {
      setProfessor(loggedProfessor);
      loadProfessorClasses(loggedProfessor.id);
    } else if (!user || user.type !== 'professor') {
      console.log('Nenhum professor logado encontrado, redirecionando...');
      navigate('/');
    } else if (user.type === 'professor') {
      loadProfessorClasses(user.id);
    }
  }, [user, navigate]);

  const loadProfessorClasses = (professorId: string) => {
    const allClasses = getClasses();
    const myClasses = allClasses.filter(c => c.teacherIds.includes(professorId));
    setProfessorClasses(myClasses);
    console.log('Classes do professor carregadas:', myClasses);
  };

  const handleLogout = () => {
    logout();
    logoutProfessor();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/');
  };

  const currentProfessor = professor || user;

  if (!currentProfessor || currentProfessor.type !== 'professor') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-ebd-gradient flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bem-vindo, {currentProfessor.name}
          </h1>
          <p className="text-gray-600 mt-2">Painel do Professor</p>
        </div>

        {/* Informações do Professor */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" />
              Suas Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Nome:</label>
                <p className="text-lg font-semibold text-gray-900">{currentProfessor.name}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Telefone:</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-lg font-semibold text-gray-900">{currentProfessor.phone}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Usuário:</label>
                <p className="text-lg font-semibold text-gray-900">{currentProfessor.username}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Igreja:</label>
                <p className="text-lg font-semibold text-gray-900">{currentProfessor.churchName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes do Professor */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-5 h-5" />
              Minhas Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {professorClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professorClasses.map(classData => (
                  <div key={classData.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-lg mb-2">{classData.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{classData.students.length} alunos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>{classData.announcements.length} avisos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não foi atribuído a nenhuma classe.</p>
                <p className="text-sm text-gray-400 mt-2">Peça ao secretário para atribuí-lo a uma ou mais classes.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/attendance')}
            className="p-6 h-auto flex-col bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
            variant="outline"
          >
            <Users className="w-8 h-8 mb-2" />
            <span className="font-medium">Presença</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/announcements')}
            className="p-6 h-auto flex-col bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
            variant="outline"
          >
            <MessageSquare className="w-8 h-8 mb-2" />
            <span className="font-medium">Avisos</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="p-6 h-auto flex-col bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
            variant="outline"
          >
            <GraduationCap className="w-8 h-8 mb-2" />
            <span className="font-medium">Dashboard</span>
          </Button>
        </div>

        {/* Botão Sair */}
        <div className="text-center">
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="px-8 py-3 font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};
