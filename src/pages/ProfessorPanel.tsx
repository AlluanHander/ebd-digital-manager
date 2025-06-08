
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Phone, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLoggedProfessor, logoutProfessor } from '@/lib/storage';

export const ProfessorPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professor, setProfessor] = useState(user);

  useEffect(() => {
    // Verificar se há um professor logado no localStorage
    const loggedProfessor = getLoggedProfessor();
    console.log('Professor logado encontrado no localStorage:', loggedProfessor);
    
    if (loggedProfessor) {
      setProfessor(loggedProfessor);
    } else if (!user || user.type !== 'professor') {
      console.log('Nenhum professor logado encontrado, redirecionando...');
      navigate('/');
    }
  }, [user, navigate]);

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
      <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Informações de Debug (temporário) */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-sm">Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-yellow-700">
            <p>ID: {currentProfessor.id}</p>
            <p>Email: {currentProfessor.email}</p>
            <p>Criado em: {new Date(currentProfessor.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>

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
