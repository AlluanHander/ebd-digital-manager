
import { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClasses } from '@/lib/storage';
import { Class, Birthday } from '@/types';
import { CalendarDays, Cake, Clock, BookOpen } from 'lucide-react';

export const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    const allClasses = getClasses();
    setClasses(allClasses);
    
    // Compilar todos os aniversários
    const allBirthdays: Birthday[] = [];
    allClasses.forEach(classData => {
      allBirthdays.push(...classData.birthdays);
    });
    setBirthdays(allBirthdays);
  }, []);

  // Calcular informações do ciclo EBD
  const getCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return `${year}-Q${Math.floor(month / 3) + 1}`;
  };

  const getCurrentWeekInQuarter = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekOfYear = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return ((weekOfYear - 1) % 13) + 1;
  };

  const getQuarterProgress = () => {
    const currentWeek = getCurrentWeekInQuarter();
    return Math.round((currentWeek / 13) * 100);
  };

  const getWeeksRemaining = () => {
    return 13 - getCurrentWeekInQuarter();
  };

  // Encontrar aniversários de uma data específica
  const getBirthdaysForDate = (selectedDate: Date) => {
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    
    return birthdays.filter(birthday => 
      birthday.month === month && birthday.day === day
    );
  };

  // Encontrar aniversários do mês atual
  const getCurrentMonthBirthdays = () => {
    const currentMonth = new Date().getMonth() + 1;
    return birthdays
      .filter(birthday => birthday.month === currentMonth)
      .sort((a, b) => a.day - b.day);
  };

  const getClassName = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    return classData?.name || 'Classe não encontrada';
  };

  const formatBirthdayDate = (birthday: Birthday) => {
    const date = new Date(2024, birthday.month - 1, birthday.day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const selectedDateBirthdays = date ? getBirthdaysForDate(date) : [];
  const currentMonthBirthdays = getCurrentMonthBirthdays();
  const currentQuarter = getCurrentQuarter();
  const currentWeek = getCurrentWeekInQuarter();
  const quarterProgress = getQuarterProgress();
  const weeksRemaining = getWeeksRemaining();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendário EBD</h1>
        <p className="text-gray-600">Acompanhe o ciclo de 13 semanas e datas importantes</p>
      </div>

      {/* Informações do Ciclo EBD */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ciclo EBD Atual - {currentQuarter}
          </CardTitle>
          <CardDescription>
            Informações sobre o trimestre e progresso das aulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentWeek}</div>
              <div className="text-sm text-gray-600">Semana Atual</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{quarterProgress}%</div>
              <div className="text-sm text-gray-600">Progresso</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{weeksRemaining}</div>
              <div className="text-sm text-gray-600">Semanas Restantes</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">13</div>
              <div className="text-sm text-gray-600">Total do Ciclo</div>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso do Trimestre</span>
              <span>{quarterProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${quarterProgress}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Calendário
            </CardTitle>
            <CardDescription>
              Selecione uma data para ver aniversários e eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full"
              modifiers={{
                birthday: (date) => {
                  const month = date.getMonth() + 1;
                  const day = date.getDate();
                  return birthdays.some(b => b.month === month && b.day === day);
                }
              }}
              modifiersStyles={{
                birthday: {
                  backgroundColor: '#fce7f3',
                  color: '#be185d',
                  fontWeight: 'bold'
                }
              }}
            />
            
            {/* Legenda */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-200 rounded"></div>
                <span className="text-sm text-gray-600">Dias com aniversários</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos do Dia Selecionado */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {date ? date.toLocaleDateString('pt-BR') : 'Selecione uma data'}
              </CardTitle>
              <CardDescription>
                Eventos e aniversários do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateBirthdays.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Cake className="w-4 h-4 text-pink-500" />
                    Aniversários
                  </h4>
                  {selectedDateBirthdays.map(birthday => (
                    <div key={birthday.id} className="p-3 bg-pink-50 rounded-lg">
                      <div className="font-medium text-pink-900">{birthday.studentName}</div>
                      <div className="text-sm text-pink-700">{getClassName(birthday.classId)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Cake className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum evento neste dia</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aniversários do Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="w-5 h-5" />
                Aniversários do Mês
              </CardTitle>
              <CardDescription>
                Aniversariantes de {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentMonthBirthdays.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {currentMonthBirthdays.map(birthday => (
                    <div key={birthday.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{birthday.studentName}</div>
                        <div className="text-sm text-gray-500">{getClassName(birthday.classId)}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-pink-600 border-pink-300">
                          {formatBirthdayDate(birthday)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Cake className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum aniversário este mês</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumo das Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Classes Ativas</CardTitle>
          <CardDescription>
            Informações gerais das classes no trimestre {currentQuarter}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(classData => (
                <div key={classData.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">{classData.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Professores: {classData.teacherNames.join(', ')}</div>
                    <div>Alunos: {classData.students.length}</div>
                    <div>Aniversários: {classData.birthdays.length}</div>
                    <div>Visitantes: {classData.visitors.length}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma classe cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
