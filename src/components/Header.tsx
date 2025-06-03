
import { useAuth } from '@/hooks/useAuth';
import { getChurchName } from '@/lib/storage';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Church, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Header = () => {
  const { user, logout } = useAuth();
  const churchName = getChurchName();

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ebd-gradient flex items-center justify-center">
            <Church className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EBD DIGITAL
            </h1>
            {churchName && (
              <p className="text-sm text-gray-600">{churchName}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.type}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Sair</span>
        </Button>
      </div>
    </header>
  );
};
