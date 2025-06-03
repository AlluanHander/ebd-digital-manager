
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, getChurchName, getAttendanceRecords } from '@/lib/storage';
import { Class, AttendanceRecord } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, MessageSquare, Package, BarChart3, Cake, UserPlus } from 'lucide-react';
import { MiniCalendar } from '@/components/MiniCalendar';

export const Dashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const churchName = getChurchName();

  useEffect(() => {
    const allClasses = getClasses();
    const allAttendance = getAttendanceRecords();
    
    // Filter classes based on user type
    if (user?.type === 'professor') {
      const userClasses = allClasses.filter(c => 
        c.teacherIds.includes(user.id) || user.classIds?.includes(c.id)
      );
      setClasses(userClasses);
    } else {
      setClasses(allClasses);
    }
    
    setAttendanceRecords(allAttendance);
  }, [user]);

  // Calculate current quarter stats
  const getCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return `${year}-Q${Math.floor(month / 3) + 1}`;
  };

  const currentQuarter = getCurrentQuarter();
  const quarterAttendance = attendanceRecords.filter(record => 
    record.quarter === currentQuarter && record.present
  );

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
  const totalVisitors = classes.reduce((sum, c) => sum + c.visitors.length, 0);
  const totalAnnouncements = classes.reduce((sum, c) => sum + c.announcements.length, 0);
  const totalInventory = classes.reduce((sum, c) => sum + (c.inventory?.bibles || 0) + (c.inventory?.magazines || 0), 0);

  // Birthday calculations
  const today = new Date();
  const todayBirthdays = classes.reduce((total, c) => {
    return total + c.birthdays.filter(b => {
      const birthday = new Date(b.date);
      return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
    }).length;
  }, 0);

  const professorStats = [
    {
      title: "Presença (Trimestre)",
      value: quarterAttendance.length,
      icon: UserCheck,
      color: "bg-green-500",
      description: "Alunos presentes no trimestre"
    },
    {
      title: "Visitantes",
      value: totalVisitors,
      icon: UserPlus,
      color: "bg-blue-500",
      description: "Visitantes registrados"
    },
    {
      title: "Aniversários Hoje",
      value: todayBirthdays,
      icon: Cake,
      color: "bg-pink-500",
      description: "Aniversariantes de hoje"
    },
    {
      title: "Inventário Total",
      value: totalInventory,
      icon: Package,
      color: "bg-purple-500",
      description: "Bíblias + Revistas"
    },
  ];

  const secretaryStats = [
    {
      title: "Total de Classes",
      value: classes.length,
      icon: Users,
      color: "bg-blue-500",
      description: "Classes ativas"
    },
    {
      title: "Total de Alunos",
      value: totalStudents,
      icon: UserCheck,
      color: "bg-green-500",
      description: "Membros cadastrados"
    },
    {
      title: "Presença (Trimestre)",
      value: quarterAttendance.length,
      icon: Calendar,
      color: "bg-purple-500",
      description: "Presenças no trimestre atual"
    },
    {
      title: "Visitantes",
      value: totalVisitors,
      icon: UserPlus,
      color: "bg-orange-500",
      description: "Visitantes registrados"
    },
    {
      title: "Aniversários Hoje",
      value: todayBirthdays,
      icon: Cake,
      color: "bg-pink-500",
      description: "Aniversariantes de hoje"
    },
    {
      title: "Inventário Total",
      value: totalInventory,
      icon: Package,
      color: "bg-indigo-500",
      description: "Total de materiais"
    },
  ];

  const stats = user?.type === 'professor' ? professorStats : secretaryStats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard {user?.type === 'professor' ? 'Professor' : 'Secretário'}
        </h1>
        <p className="text-gray-600">
          Bem-vindo(a), {user?.name}! Aqui está um resumo das atividades da EBD.
        </p>
        {churchName && (
          <p className="text-sm text-gray-500">{churchName}</p>
        )}
        <div className="text-sm text-blue-600 font-medium">
          Trimestre Atual: {currentQuarter} • Dados zerados a cada 13 semanas
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={stat.title} className="hover-lift bg-white border-0 shadow-md animate-scale-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="lg:col-span-1">
          <MiniCalendar />
        </div>
      </div>

      {/* Classes Overview - Different for each user type */}
      {user?.type === 'secretario' ? (
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Resumo Geral das Classes
            </CardTitle>
            <CardDescription>
              Visão geral de todas as classes da EBD
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classData) => (
                  <Card key={classData.id} className="hover-lift border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900">{classData.name}</CardTitle>
                      <CardDescription>
                        Professores: {classData.teacherNames.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Alunos:</span>
                          <span className="font-medium">{classData.students.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Visitantes:</span>
                          <span className="font-medium">{classData.visitors.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avisos:</span>
                          <span className="font-medium">{classData.announcements.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inventário:</span>
                          <span className="font-medium">{(classData.inventory?.bibles || 0) + (classData.inventory?.magazines || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma classe encontrada</p>
                <p className="text-sm text-gray-400 mt-1">Comece criando sua primeira classe</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Suas Classes
            </CardTitle>
            <CardDescription>
              Classes que você leciona
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classData) => (
                  <Card key={classData.id} className="hover-lift border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900">{classData.name}</CardTitle>
                      <CardDescription>
                        Professores: {classData.teacherNames.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Alunos:</span>
                          <span className="font-medium">{classData.students.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Visitantes:</span>
                          <span className="font-medium">{classData.visitors.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aniversários:</span>
                          <span className="font-medium">{classData.birthdays.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma classe atribuída</p>
                <p className="text-sm text-gray-400 mt-1">Entre em contato com o secretário para ser atribuído a uma classe</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
