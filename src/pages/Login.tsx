
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { findProfessorByCredentials, setLoggedProfessor } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Church, User, Lock, UserCheck, GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secretaryCredentials, setSecretaryCredentials] = useState({ username: 'admin', password: '1234' });
  
  const { userType } = useParams<{ userType: 'secretario' | 'professor' }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Carregar credenciais do secretário do localStorage
    const savedCredentials = localStorage.getItem('secretary_credentials');
    if (savedCredentials) {
      setSecretaryCredentials(JSON.parse(savedCredentials));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (userType === 'secretario') {
        // Verificar com as credenciais salvas do secretário
        if (username === secretaryCredentials.username && password === secretaryCredentials.password) {
          // Criar um usuário secretário mockado
          const secretaryUser = {
            id: 'secretary-1',
            name: 'Administrador',
            email: 'admin@ebd.local',
            username: secretaryCredentials.username,
            password: secretaryCredentials.password,
            phone: '',
            type: 'secretario' as const,
            classIds: [],
            churchName: 'Igreja Local',
            createdAt: new Date().toISOString(),
          };

          login(secretaryUser);
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo(a), ${secretaryUser.name}!`,
          });

          navigate('/dashboard');
        } else {
          toast({
            title: "Erro no login",
            description: `Credenciais inválidas. Use: ${secretaryCredentials.username} / ${secretaryCredentials.password}`,
            variant: "destructive",
          });
        }
      } else {
        // Login do professor - verificar usando a nova função
        console.log('Tentando login do professor com:', { username, password });
        
        const professor = findProfessorByCredentials(username, password);

        if (!professor) {
          toast({
            title: "Erro no login",
            description: "Usuário ou senha incorretos. Verifique se o professor foi cadastrado pelo secretário.",
            variant: "destructive",
          });
          return;
        }

        console.log('Login do professor bem-sucedido:', professor);

        // Salvar professor logado
        setLoggedProfessor(professor);
        login(professor);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${professor.name}!`,
        });

        navigate('/professor-panel');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    return userType === 'secretario' ? 'Login do Secretário' : 'Login do Professor';
  };

  const getIcon = () => {
    return userType === 'secretario' ? <UserCheck className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="bg-ebd-card shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="w-16 h-16 mx-auto rounded-full bg-ebd-gradient flex items-center justify-center shadow-lg">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getTitle()}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {userType === 'secretario' 
                  ? 'Acesse o painel administrativo' 
                  : 'Acesse seu painel de professor'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder={userType === 'secretario' ? `Digite: ${secretaryCredentials.username}` : "Digite seu usuário"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={userType === 'secretario' ? `Digite: ${secretaryCredentials.password}` : "Digite sua senha"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full bg-ebd-gradient hover:opacity-90 text-white font-medium py-2.5 transition-all hover-lift"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Entrar
                  </div>
                )}
              </Button>
            </form>

            {userType === 'secretario' && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">💡 Credenciais atuais do secretário:</p>
                <p>• Usuário: {secretaryCredentials.username}</p>
                <p>• Senha: {secretaryCredentials.password}</p>
                <p className="text-xs text-gray-400 mt-1">Configuráveis no painel administrativo</p>
              </div>
            )}

            {userType === 'professor' && (
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-medium mb-1">📝 Para professores:</p>
                <p>• Use o usuário e senha criados pelo secretário</p>
                <p>• Se não conseguir entrar, peça ao secretário para verificar seus dados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
