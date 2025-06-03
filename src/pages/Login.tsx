
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { getUsers, getChurchName, setChurchName, getSavedCredentials, setSavedCredentials, clearSavedCredentials } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Church, Mail, Lock, UserCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'professor' | 'secretario'>('professor');
  const [churchName, setChurchNameState] = useState('');
  const [saveCredentials, setSaveCredentialsState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedChurch = getChurchName();
    if (savedChurch) {
      setChurchNameState(savedChurch);
    }

    const savedCreds = getSavedCredentials();
    if (savedCreds) {
      setEmail(savedCreds.email);
      setPassword(savedCreds.password);
      setSaveCredentialsState(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save church name
      if (churchName.trim()) {
        setChurchName(churchName.trim());
      }

      // Find user
      const users = getUsers();
      const user = users.find(u => 
        u.email === email && 
        u.type === userType
      );

      if (!user) {
        toast({
          title: "Erro no login",
          description: "Usuário não encontrado. Verifique os dados ou cadastre-se.",
          variant: "destructive",
        });
        return;
      }

      // Save credentials if requested
      if (saveCredentials) {
        setSavedCredentials(email, password);
      } else {
        clearSavedCredentials();
      }

      // Login user
      login(user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${user.name}!`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Recuperação de senha",
      description: "Entre em contato com ebdvilaelida2024@gmail.com para recuperar sua senha.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="bg-ebd-card shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-ebd-gradient flex items-center justify-center shadow-lg">
              <Church className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EBD DIGITAL
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sistema de Gestão da Escola Bíblica Dominical
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Church Name */}
              <div className="space-y-2">
                <Label htmlFor="church" className="text-sm font-medium text-gray-700">
                  Nome da Igreja
                </Label>
                <div className="relative">
                  <Church className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="church"
                    type="text"
                    placeholder="Digite o nome da igreja"
                    value={churchName}
                    onChange={(e) => setChurchNameState(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Tipo de Usuário</Label>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'professor' | 'secretario')}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="professor" id="professor" />
                    <Label htmlFor="professor" className="flex-1 cursor-pointer">Professor</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="secretario" id="secretario" />
                    <Label htmlFor="secretario" className="flex-1 cursor-pointer">Secretário</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Save Credentials */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-credentials" 
                  checked={saveCredentials}
                  onCheckedChange={(checked) => setSaveCredentialsState(!!checked)}
                />
                <Label htmlFor="save-credentials" className="text-sm text-gray-600 cursor-pointer">
                  Salvar credenciais
                </Label>
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

            {/* Footer Links */}
            <div className="text-center space-y-3 pt-4 border-t border-gray-100">
              <Button
                variant="link"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Esqueceu a senha?
              </Button>
              <div className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                >
                  Cadastre-se
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
