
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
    <header className="h-14 sm:h-16 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-6 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <SidebarTrigger className="lg:hidden shrink-0" />
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-ebd-gradient flex items-center justify-center shrink-0">
            <Church className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              EBD DIGITAL
            </h1>
            {churchName && (
              <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                {churchName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium truncate max-w-32">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.type}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 sm:px-3"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Sair</span>
        </Button>
      </div>
    </header>
  );
};
