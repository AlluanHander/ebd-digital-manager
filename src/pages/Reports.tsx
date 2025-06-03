
import { useState, useEffect } from 'react';
import { getClasses, getAttendanceRecords, getCurrentQuarter } from '@/lib/storage';
import { Class, AttendanceRecord } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, UserCheck, Cake, UserPlus, Package, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Reports = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const allClasses = getClasses();
    const allAttendance = getAttendanceRecords();
    setClasses(allClasses);
    setAttendanceRecords(allAttendance);
  }, []);

  const currentQuarter = getCurrentQuarter();
  const quarterAttendance = attendanceRecords.filter(record => 
    record.quarter === currentQuarter && record.present
  );

  // Dados para gráficos
  const getClassesData = () => {
    return classes.map(classData => ({
      name: classData.name,
      alunos: classData.students.length,
      presenca: quarterAttendance.filter(a => a.classId === classData.id).length,
      aniversarios: classData.birthdays.length,
      visitantes: classData.visitors.length,
      inventario: (classData.inventory?.bibles || 0) + (classData.inventory?.magazines || 0)
    }));
  };

  const getTotalStats = () => {
    const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
    const totalAttendance = quarterAttendance.length;
    const totalBirthdays = classes.reduce((sum, c) => sum + c.birthdays.length, 0);
    const totalVisitors = classes.reduce((sum, c) => sum + c.visitors.length, 0);
    const totalInventory = classes.reduce((sum, c) => sum + (c.inventory?.bibles || 0) + (c.inventory?.magazines || 0), 0);
    
    return {
      totalStudents,
      totalAttendance,
      totalBirthdays,
      totalVisitors,
      totalInventory,
      totalClasses: classes.length
    };
  };

  const getAttendanceByWeek = () => {
    const weeklyData: { [key: number]: number } = {};
    
    quarterAttendance.forEach(record => {
      weeklyData[record.week] = (weeklyData[record.week] || 0) + 1;
    });

    return Array.from({ length: 13 }, (_, i) => ({
      week: i + 1,
      presenca: weeklyData[i + 1] || 0
    }));
  };

  const getPieChartData = () => {
    const stats = getTotalStats();
    return [
      { name: 'Alunos', value: stats.totalStudents, color: '#3b82f6' },
      { name: 'Presenças', value: stats.totalAttendance, color: '#10b981' },
      { name: 'Visitantes', value: stats.totalVisitors, color: '#f59e0b' },
      { name: 'Aniversários', value: stats.totalBirthdays, color: '#ec4899' },
      { name: 'Inventário', value: stats.totalInventory, color: '#8b5cf6' }
    ];
  };

  const stats = getTotalStats();
  const classesData = getClassesData();
  const weeklyAttendance = getAttendanceByWeek();
  const pieData = getPieChartData();

  const getAttendanceRate = () => {
    if (stats.totalStudents === 0) return 0;
    return Math.round((stats.totalAttendance / (stats.totalStudents * 13)) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Análise geral das atividades da EBD - {currentQuarter}</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
              <Users className="w-4 h-4" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.totalClasses}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 text-sm">
              <UserCheck className="w-4 h-4" />
              Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700 text-sm">
              <Calendar className="w-4 h-4" />
              Presenças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.totalAttendance}</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700 text-sm">
              <UserPlus className="w-4 h-4" />
              Visitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{stats.totalVisitors}</div>
          </CardContent>
        </Card>

        <Card className="bg-pink-50 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-pink-700 text-sm">
              <Cake className="w-4 h-4" />
              Aniversários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-800">{stats.totalBirthdays}</div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-sm">
              <Package className="w-4 h-4" />
              Materiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-800">{stats.totalInventory}</div>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Presença */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Taxa de Presença - {currentQuarter}
          </CardTitle>
          <CardDescription>
            Percentual de presença baseado no total de alunos e semanas do trimestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center text-blue-600">
            {getAttendanceRate()}%
          </div>
          <div className="text-center text-gray-600 mt-2">
            {stats.totalAttendance} presenças de {stats.totalStudents * 13} possíveis
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Dados por Classe
            </CardTitle>
            <CardDescription>
              Comparativo de alunos, presenças e visitantes por classe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="alunos" fill="#3b82f6" name="Alunos" />
                  <Bar dataKey="presenca" fill="#10b981" name="Presenças" />
                  <Bar dataKey="visitantes" fill="#f59e0b" name="Visitantes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição Geral
            </CardTitle>
            <CardDescription>
              Proporção entre diferentes categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Presença por Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Presença por Semana - {currentQuarter}
          </CardTitle>
          <CardDescription>
            Acompanhamento da presença ao longo das 13 semanas do trimestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" label={{ value: 'Semana', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Presenças', angle: -90, position: 'insideLeft' }} />
                <Tooltip labelFormatter={(week) => `Semana ${week}`} />
                <Bar dataKey="presenca" fill="#10b981" name="Presenças" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Classes Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado por Classe</CardTitle>
          <CardDescription>
            Informações completas de cada classe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Classe</th>
                  <th className="text-center p-3 font-medium text-gray-900">Alunos</th>
                  <th className="text-center p-3 font-medium text-gray-900">Presenças</th>
                  <th className="text-center p-3 font-medium text-gray-900">Visitantes</th>
                  <th className="text-center p-3 font-medium text-gray-900">Aniversários</th>
                  <th className="text-center p-3 font-medium text-gray-900">Materiais</th>
                  <th className="text-center p-3 font-medium text-gray-900">Taxa Presença</th>
                </tr>
              </thead>
              <tbody>
                {classesData.map((classData, index) => {
                  const attendanceRate = classData.alunos > 0 ? Math.round((classData.presenca / (classData.alunos * 13)) * 100) : 0;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{classData.name}</td>
                      <td className="text-center p-3">
                        <Badge variant="outline">{classData.alunos}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge variant="default">{classData.presenca}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge variant="secondary">{classData.visitantes}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge variant="outline" className="border-pink-300 text-pink-700">{classData.aniversarios}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge variant="outline" className="border-purple-300 text-purple-700">{classData.inventario}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge variant={attendanceRate >= 70 ? "default" : "secondary"}>
                          {attendanceRate}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
