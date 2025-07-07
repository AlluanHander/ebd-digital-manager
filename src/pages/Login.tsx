
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { findProfessorByCredentials, setLoggedProfessor } from '@/lib/supabase-storage';
import { useToast } from '@/hooks/use-toast';
import { Church, User, Lock, UserCheck, GraduationCap, ArrowLeft, Eye, EyeOff, Activity, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeSystemSettings } from '@/hooks/useRealtimeData';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('conectando');
  
  const { userType } = useParams<{ userType: 'secretario' | 'professor' }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use realtime system settings para credenciais sempre atualizadas
  const { secretaryCredentials, loading: settingsLoading } = useRealtimeSystemSettings();

  useEffect(() => {
    if (!settingsLoading) {
      setConnectionStatus('conectado');
    } else {
      setConnectionStatus('conectando');
    }
  }, [settingsLoading]);

  useEffect(() => {
    console.log('🔄 [LOGIN] Credenciais do secretário atualizadas em tempo real:', secretaryCredentials);
  }, [secretaryCredentials]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (userType === 'secretario') {
        console.log('🔐 [LOGIN] Tentativa de login do secretário:', { username, password });
        console.log('✅ [LOGIN] Credenciais corretas (sincronizadas):', secretaryCredentials);
        
        if (username === secretaryCredentials.username && password === secretaryCredentials.password) {
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
            title: "✅ Login realizado com sucesso!",
            description: `Bem-vindo(a), ${secretaryUser.name}! Sistema sincronizado em tempo real entre TODOS os dispositivos.`,
          });

          navigate('/dashboard');
        } else {
          toast({
            title: "❌ Erro no login",
            description: `Credenciais inválidas. Use: ${secretaryCredentials.username} / ${secretaryCredentials.password}`,
            variant: "destructive",
          });
        }
      } else {
        console.log('🔐 [LOGIN] Tentando login do professor com:', { username, password });
        
        // Buscar professor diretamente do Supabase (dados sincronizados em tempo real)
        const professor = await findProfessorByCredentials(username, password);

        if (!professor) {
          toast({
            title: "❌ Erro no login",
            description: "Usuário ou senha incorretos. Verifique se o professor foi cadastrado pelo secretário (dados sincronizados em tempo real).",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ [LOGIN] Login do professor bem-sucedido (dados sincronizados):', professor);

        // Salvar professor logado no localStorage para sessão local
        setLoggedProfessor(professor);
        login(professor);
        
        toast({
          title: "✅ Login realizado com sucesso!",
          description: `Bem-vindo(a), ${professor.name}! Dados sincronizados em tempo real entre TODOS os dispositivos.`,
        });

        navigate('/professor-panel');
      }
    } catch (error) {
      console.error('❌ [LOGIN] Erro no login:', error);
      toast({
        title: "❌ Erro no login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'conectado':
        return <Activity className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'conectando':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'conectado':
        return '🟢 Conectado - Credenciais sincronizadas';
      case 'conectando':
        return '🟡 Conectando - Sincronizando credenciais...';
      default:
        return '🔴 Desconectado - Verifique sua conexão';
    }
  };

  const getTitle = () => {
    return userType === 'secretario' ? 'Login do Secretário' : 'Login do Professor';
  };

  const getIcon = () => {
    return userType === 'secretario' ? <UserCheck className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />;
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 flex items-center gap-2 justify-center">
            <Wifi className="w-4 h-4 animate-pulse" />
            🔄 Carregando configurações sincronizadas...
          </p>
          <p className="text-xs text-gray-500 mt-2">Estabelecendo conexão em tempo real entre dispositivos</p>
        </div>
      </div>
    );
  }

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
            
            {/* Status da Conexão */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-2 mb-4">
              <div className="flex items-center gap-2 text-xs justify-center">
                {getConnectionIcon()}
                <span className="font-medium">{getConnectionText()}</span>
              </div>
            </div>
            
            <div className="w-16 h-16 mx-auto rounded-full bg-ebd-gradient flex items-center justify-center shadow-lg">
              {userType === 'secretario' ? <UserCheck className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {userType === 'secretario' ? 'Login do Secretário' : 'Login do Professor'}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {userType === 'secretario' 
                  ? '🔄 Acesse o painel administrativo (sincronizado em TODOS os dispositivos)' 
                  : '🔄 Acesse seu painel de professor (sincronizado entre TODOS os dispositivos)'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
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
                <p className="font-medium mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-500" />
                  🔄 Credenciais atuais (sincronizadas em TEMPO REAL):
                </p>
                <p>• Usuário: {secretaryCredentials.username}</p>
                <p>• Senha: {secretaryCredentials.password}</p>
                <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  ✅ Atualizadas automaticamente em TODOS os dispositivos conectados
                </p>
              </div>
            )}

            {userType === 'professor' && (
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-medium mb-1">👨‍🏫 Para professores:</p>
                <p>• Use o usuário e senha criados pelo secretário</p>
                <p>• Se não conseguir entrar, peça ao secretário para verificar seus dados</p>
                <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  🔄 Os dados são sincronizados em TEMPO REAL entre TODOS os dispositivos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
