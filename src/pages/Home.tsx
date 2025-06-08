
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Church, UserCheck, GraduationCap } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

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

          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/login/secretario')}
              className="w-full bg-ebd-gradient hover:opacity-90 text-white font-medium py-3 transition-all hover-lift"
            >
              <UserCheck className="w-5 h-5 mr-2" />
              🔐 Entrar como Secretário
            </Button>

            <Button 
              onClick={() => navigate('/login/professor')}
              variant="outline"
              className="w-full border-2 border-blue-200 hover:bg-blue-50 font-medium py-3 transition-all hover-lift"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              👨‍🏫 Entrar como Professor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
