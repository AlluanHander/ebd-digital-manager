
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, getChurchName, getAttendanceRecords } from '@/lib/storage';
import { Class, AttendanceRecord } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, MessageSquare, Package, BarChart3 } from 'lucide-react';

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

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
  const totalVisitors = classes.reduce((sum, c) => sum + c.visitors.length, 0);
  const totalAnnouncements = classes.reduce((sum, c) => sum + c.announcements.length, 0);

  const thisWeekAttendance = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return recordDate >= weekStart && record.present;
  }).length;

  const stats = [
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
      title: "Presença esta Semana",
      value: thisWeekAttendance,
      icon: Calendar,
      color: "bg-purple-500",
      description: "Alunos presentes"
    },
    {
      title: "Visitantes",
      value: totalVisitors,
      icon: MessageSquare,
      color: "bg-orange-500",
      description: "Visitantes registrados"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bem-vindo(a), {user?.name}! Aqui está um resumo das atividades da EBD.
        </p>
        {churchName && (
          <p className="text-sm text-gray-500">{churchName}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Classes Overview */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Suas Classes
          </CardTitle>
          <CardDescription>
            {user?.type === 'professor' ? 'Classes que você leciona' : 'Todas as classes da EBD'}
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
                        <span className="text-gray-600">Avisos:</span>
                        <span className="font-medium">{classData.announcements.length}</span>
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
              <p className="text-sm text-gray-400 mt-1">
                {user?.type === 'professor' 
                  ? 'Você ainda não foi atribuído a nenhuma classe'
                  : 'Comece criando sua primeira classe'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover-lift cursor-pointer border border-gray-100">
              <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Presença</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover-lift cursor-pointer border border-gray-100">
              <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Avisos</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover-lift cursor-pointer border border-gray-100">
              <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Inventário</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover-lift cursor-pointer border border-gray-100">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Relatórios</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
