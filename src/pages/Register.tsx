
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { saveUser, generateId } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Church, User, Mail, Lock, UserPlus } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'professor' as 'professor' | 'secretario',
    churchName: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erro no cadastro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        return;
      }

      if (!acceptTerms) {
        toast({
          title: "Erro no cadastro",
          description: "Você deve aceitar os termos de uso.",
          variant: "destructive",
        });
        return;
      }

      // Create user
      const newUser = {
        id: generateId(),
        name: formData.name,
        email: formData.email,
        type: formData.userType,
        classIds: [],
        churchName: formData.churchName,
        createdAt: new Date().toISOString(),
      };

      saveUser(newUser);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você pode fazer login agora.",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="bg-ebd-card shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-ebd-gradient flex items-center justify-center shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cadastro
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Crie sua conta no EBD Digital
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

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
                    value={formData.churchName}
                    onChange={(e) => handleInputChange('churchName', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Tipo de Usuário</Label>
                <RadioGroup 
                  value={formData.userType} 
                  onValueChange={(value) => handleInputChange('userType', value)}
                >
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
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Accept Terms */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="accept-terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                />
                <Label htmlFor="accept-terms" className="text-sm text-gray-600 cursor-pointer">
                  Aceito os termos de uso e políticas de privacidade
                </Label>
              </div>

              {/* Register Button */}
              <Button 
                type="submit" 
                className="w-full bg-ebd-gradient hover:opacity-90 text-white font-medium py-2.5 transition-all hover-lift"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cadastrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Cadastrar
                  </div>
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                >
                  Fazer login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
